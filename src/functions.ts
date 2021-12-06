import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk'
import { v4 } from 'uuid'


const dbClient = new AWS.DynamoDB.DocumentClient()
const tableName = 'ToDoListTable'

interface ToDoListI {
  label: string,
  completed: boolean,
}

//This function is responsible for adding a new item to the To-Do List
export const addNewItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const reqData = JSON.parse(event.body as string) as ToDoListI

  const createdAt = new Date

  const updatedAt = new Date

  const listItem = {
    toDoListID: v4(),
    ...reqData,
    createdAt,
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
};

//This function updates a To-do list item based on the id
export const updateListItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const reqData = JSON.parse(event.body as string) as ToDoListI

  const id = event.pathParameters?.id

  const checkForID = await dbClient.get({
    TableName: tableName,
    Key: {
      toDoListID: id,
    }
  }).promise()

  if (!checkForID.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify(({ error: 'item not found' }), null, 2)
    }
  }

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
}

//This function gets and displays all the items in on the To-do list
export const showAllItems = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
}
