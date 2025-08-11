import { APIGatewayProxyHandler, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import aws from 'aws-sdk';
const dynamoDb = new aws.DynamoDB.DocumentClient();
const DBTablename:string = process.env.AUCTION_TABLE || 'AuctionTable';

//middleware imports
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import createError from 'http-errors';


async function getAuctionByIdHandler(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
  
  try{
    
    const { id } = event.pathParameters;
    const queryParam = { TableName: DBTablename, Key: {id}};

     const result = await dynamoDb.get(queryParam);
     
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: result.Item || 'Auction not found'
        })
      };
   
  }catch (error) {
    console.error("Error fetching auction:", error);
    throw createError(500, 'Could not fetch auction');
  }

}


export const getById: APIGatewayProxyHandler = middy(getAuctionByIdHandler)
  .use(httpErrorHandler())
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser());

