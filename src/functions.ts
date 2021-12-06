import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk'
import { v4 } from 'uuid'
import * as yup from 'yup'

const dbClient = new AWS.DynamoDB.DocumentClient()
const tableName = 'ToDoListTable'

interface ToDoListI {
  label: string,
  completed: boolean,
}

class HttpError extends Error {
  constructor(public statusCode: number, body: Record<string, unknown> = {}) {
    super(JSON.stringify(body));
  }
}

//Helper function for error handling
const handleError = (error: unknown) => {
  if (error instanceof yup.ValidationError) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        errors: error.errors,
      }),
    };
  }

  if (error instanceof SyntaxError) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `invalid request body format : "${error.message}"` }),
    };
  }

  if (error instanceof HttpError) {
    return {
      statusCode: error.statusCode,
      body: error.message,
    };
  }

  throw error;
};


//Helper function to get the id of a specific list item
const fetchProductById = async (id: string) => {
  const checkForID = await dbClient.get({
    TableName: tableName,
    Key: {
      toDoListID: id,
    }
  }).promise()

  if (!checkForID.Item) {
    throw new HttpError(404, { error: 'item not found' })
  }
  return checkForID.Item
}

const schema = yup.object().shape({
  label: yup.string().required(),
  completed: yup.bool().required()
})

//This function is responsible for adding a new item to the To-Do List
export const addNewItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqData = JSON.parse(event.body as string) as ToDoListI

    await schema.validate(reqData, { abortEarly: false })

    const actionTimeStamp = new Date().toISOString()

    const listItem = {
      toDoListID: v4(),
      ...reqData,
      createdAt: actionTimeStamp,
      updatedAt: actionTimeStamp,
    }

    await dbClient.put({
      TableName: tableName,
      Item: listItem,
    }).promise()

    return {
      statusCode: 200,
      body: JSON.stringify((listItem), null, 2),
    };
  } catch (error) {
    return handleError(error)
  }

};

//This function updates a To-do list item based on the id
export const updateListItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqData = JSON.parse(event.body as string) as ToDoListI

    await schema.validate(reqData, { abortEarly: false })

    const id = event.pathParameters?.id as string

    await fetchProductById(id)

    const updatedAt = new Date

    const listItem = {
      toDoListID: v4(),
      ...reqData,
      updatedAt,
    }

    await dbClient.put({
      TableName: tableName,
      Item: listItem,
    }).promise()

    return {
      statusCode: 200,
      body: JSON.stringify((listItem), null, 2),
    };
  } catch (error) {
    return handleError(error)
  }
}

//This function gets and displays all the items in on the To-do list
export const showAllItems = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const getItems = await dbClient.scan({
      TableName: tableName,
    }).promise()

    if (getItems.Items?.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify(({ error: 'No items available' }), null, 2)
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify((getItems.Items), null, 2)
    }
  } catch (error) {
    return handleError(error)
  }

}

//This funcition is responsible for deleting an entry based on the id
export const deleteListItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id as string

    await fetchProductById(id)

    await dbClient.delete({
      TableName: tableName,
      Key: {
        toDoListID: id,
      },
    }).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(({ success: 'Item deleted successfuly!' }), null, 2),
    };
  } catch (error) {
    return handleError(error)
  }
}