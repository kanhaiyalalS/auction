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


async function getAuctionHandler(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
  
  try{
    const queryParam = { TableName: DBTablename};

     let acutions = await dynamoDb.scan(queryParam);

    if (acutions.Items && acutions.Items.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: acutions.Items
        })
      };
    }else{
        throw createError(404, 'No auctions found');
    }
  }catch (error) {
    console.error("Error fetching auction:", error);
    throw createError(500, 'Could not fetch auction');
  }

}


export const get: APIGatewayProxyHandler = middy(getAuctionHandler)
  .use(httpErrorHandler())
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser());

