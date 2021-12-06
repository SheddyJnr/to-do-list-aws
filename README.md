# Serverless - AWS Node.js Typescript

Serverless Framework template for zero-config TypeScript support.

## Prerequisites

- [`serverless-framework`](https://github.com/serverless/serverless)
- [`node.js`](https://nodejs.org)
- Create AWS account and set up IAM user
- Install AWS-CLI and configure IAM credentials
- Install serverless framework globally with "npm install serverless -g"

## Usage
1. Clone project

2. cd into project directory and install node packages
    - command `yarn` if using yarn or
    - command `npm` install if using npm

3. DynamoDB actions and tables attributes have already been set in the serverles.yml file

4. The project has a very simple fire structure. All the lambda functions for the CRUD operations are contained in the function.ts file under src directiory

5. Finally run the command `sls deploy` or `serverless deploy` in the project root directory and you will get the endpoints in the terminal window

6. Testing of the endpoints is done using postman(you may use any other api testing tools like insomnia etc. 
   Web browser  also work for GET requests).
   - the request body is sent as a JSON object with the payload containing a string parameter: "label" and a boolean: completed.

