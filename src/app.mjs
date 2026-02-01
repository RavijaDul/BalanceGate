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
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

import jwt from "jsonwebtoken";

const dbClient = new DynamoDBClient({});
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,x-api-key,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
};

function verifyJwt(event) {
  const authHeader =
    event.headers?.authorization || event.headers?.Authorization;

  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const decoded = jwt.decode(token);
  

  if (!decoded || !decoded.sub) {
    throw new Error("Invalid token");
  }

  return decoded; // contains user id, email, etc.
}

export const lambdaHandler = async (event) => {
  console.log("Incoming request:", JSON.stringify(event));

  const method = event.httpMethod;
  // HANDLE CORS PRE-FLIGHT
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }
  let user;

  try {
    user = verifyJwt(event);
  } catch (err) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }
  const body = JSON.parse(event.body || "{}");
  // CREDIT / DEBIT WALLET
  if ( method === "POST" && event.resource === "/wallet/{walletId}/transaction") {
    const walletId = event.pathParameters.walletId;
    const { amount } = body;

    if (typeof amount !== "number") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Amount must be a number" }),
      };
    }

    const walletRes = await dbClient.send(
      new GetItemCommand({
        TableName: process.env.WALLET_TABLE,
        Key: { walletId: { S: walletId } },
      })
    );

    if (!walletRes.Item || walletRes.Item.userId.S !== user.sub) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Forbidden" }),
      };
    }

    const currentBalance = Number(walletRes.Item.balance.N);
    const newBalance = currentBalance + amount;

    // Check if the transaction would result in negative balance
    if (newBalance < 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Insufficient balance" }),
      };
    }

    try {
      const result = await dbClient.send(
        new UpdateItemCommand({
          TableName: process.env.WALLET_TABLE,
          Key: { walletId: { S: walletId } },
          UpdateExpression: "SET balance = :newBalance",
          ExpressionAttributeValues: {
            ":newBalance": { N: newBalance.toString() },
          },
          ReturnValues: "UPDATED_NEW",
        })
      );

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          balance: Number(result.Attributes.balance.N),
        }),
      };
    } catch (err) {
      console.error("Transaction error:", err);
      
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          message: "Transaction failed", 
          error: err.message 
        }),
      };
    }
  }

  // CREATE WALLET
  if (method === "POST") {
    const wallet = {
      walletId: uuidv4(),
      name: body.name || "Unnamed Wallet",
      balance: 0,
      currency: body.currency || "USD",
      createdAt: new Date().toISOString(),
    };

    try {
      await dbClient.send(
        new PutItemCommand({
          TableName: process.env.WALLET_TABLE,
          Item: {
            walletId: { S: wallet.walletId },
            userId: { S: user.sub },
            name: { S: wallet.name },
            balance: { N: "0" },
            currency: { S: wallet.currency },
            createdAt: { S: wallet.createdAt },
          }
        })
      );
    } catch (error) {
      console.error("DynamoDB error:", error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Failed to create wallet" }),
      };
    }

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(wallet),
    };
  }

  // LIST MY WALLETS
  if (method === "GET" && event.path === "/wallets") {
    const result = await dbClient.send(
      new ScanCommand({
        TableName: process.env.WALLET_TABLE,
        FilterExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": { S: user.sub },
        },
      })
    );

    const wallets = (result.Items || []).map((item) => ({
      walletId: item.walletId.S,
      name: item.name?.S || "Unnamed Wallet",
      balance: Number(item.balance.N),
      currency: item.currency.S,
      createdAt: item.createdAt.S,
    }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(wallets),
    };
  }

  // GET WALLET
  if (method === "GET") {
    const walletId = event.pathParameters?.walletId;

    if (!walletId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
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
        headers: corsHeaders,
        body: JSON.stringify({ message: "Wallet not found" }),
      };
    }
    if (result.Item.userId.S !== user.sub) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Forbidden" }),
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
      headers: corsHeaders,
      body: JSON.stringify(wallet),
    };
  }

  return {
    statusCode: 405,
    headers: corsHeaders,
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
  