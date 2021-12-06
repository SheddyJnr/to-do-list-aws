import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk'
import { v4 } from 'uuid'


const dbClient = new AWS.DynamoDB.DocumentClient()

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
    TableName: 'ToDoListTable',
    Item: listItem,
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify((listItem), null, 2),
  };
};
