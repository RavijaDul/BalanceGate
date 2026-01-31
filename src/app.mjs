/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient, PutItemCommand, GetItemCommand, } from "@aws-sdk/client-dynamodb";

const dbClient = new DynamoDBClient({});

/**
 * BalanceGate – Wallet Creation Lambda
 */
export const lambdaHandler = async (event) => {
  console.log("Incoming request:", JSON.stringify(event));

  // HTTP method from API Gateway
  //const method = event.requestContext?.http?.method;
  const method = event.httpMethod;
  
  // CREATE WALLET
  if (method === "POST") {
    const wallet = {
      walletId: uuidv4(),
      balance: 0,
      currency: "USD",
      createdAt: new Date().toISOString(),
    };

    const params = {
      TableName: process.env.WALLET_TABLE,
      Item: {
        walletId: { S: wallet.walletId },
        balance: { N: wallet.balance.toString() },
        currency: { S: wallet.currency },
        createdAt: { S: wallet.createdAt },
      },
    };

    try {
      await dbClient.send(new PutItemCommand(params));
    } catch (error) {
      console.error("DynamoDB error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to create wallet" }),
      };
    }
  }
    // GET WALLET
  if (method === "GET") {
    const walletId = event.pathParameters?.walletId;

    if (!walletId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "walletId is required" }),
      };
    }

    const result = await dbClient.send(
      new GetItemCommand({
        TableName: process.env.WALLET_TABLE,
        Key: {
          walletId: { S: walletId },
        },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Wallet not found" }),
      };
    }

    const wallet = {
      walletId: result.Item.walletId.S,
      balance: Number(result.Item.balance.N),
      currency: result.Item.currency.S,
      createdAt: result.Item.createdAt.S,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(wallet),
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: "Method Not Allowed" }),
  };
};

// export const lambdaHandler = async (event, context) => {
//     const response = {
//       statusCode: 200,
//       body: JSON.stringify({
//         message: 'hello wallet',
//       })
//     };

//     return response;
//   };
  