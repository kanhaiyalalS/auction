import { APIGatewayProxyHandler, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import aws from 'aws-sdk';
const dynamoDb = new aws.DynamoDB.DocumentClient();
import { v4 as uuidv4 } from 'uuid';
const DBTablename:string = process.env.AUCTION_TABLE || 'AuctionTable';

//middleware imports
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import createError from 'http-errors';

type requestBody = {
  title: string;
};

async function createAuctionHandler(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
  
  if(event.body === null || event.body === undefined) {
    throw createError(400, 'Request body is required');
  }

 const { title } =  event.body;

  if (!title) {
    throw createError(404, 'Title is required');
  }
  let auction = {
    id: uuidv4(),
    title,
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };

  await dynamoDb.put({
    TableName: DBTablename,
    Item: auction,
  }, (err: unknown) => {
    if (err) {
      console.error("Error creating auction:", err);
      throw createError(500, 'Could not create auction');
      }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: auction
    })
  };
}


export const create: APIGatewayProxyHandler = middy(createAuctionHandler)
  .use(httpErrorHandler())
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser());

