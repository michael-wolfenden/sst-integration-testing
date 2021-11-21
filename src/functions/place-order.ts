import { loadEnv, str } from '@/lib/env'
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { ZodIssue } from 'zod'
import { orderSchema } from '@/types'

const env = loadEnv({
  BUS_NAME: str(),
  TABLE_NAME: str(),
})

const eventBridgeClient = new EventBridgeClient({})
const documentClient = DynamoDBDocument.from(new DynamoDBClient({}))

export const handler = async (event: APIGatewayProxyEventV2) => {
  try {
    const parsedBody = JSON.parse(event.body ?? '{}')
    const parsedOrder = orderSchema.safeParse(parsedBody)
    if (!parsedOrder.success) return badRequest(parsedOrder.error.errors)

    const order = parsedOrder.data

    console.log(
      `placing order ID [${order.orderId}] for [${order.restaurantName}]`
    )

    await documentClient.send(
      new PutCommand({
        TableName: env.TABLE_NAME,
        Item: order,
      })
    )

    console.log(`saved 'order' item into DynamoDB`)

    await eventBridgeClient.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: 'sst-testing',
            DetailType: 'order-placed',
            Detail: JSON.stringify(order),
            EventBusName: env.BUS_NAME,
          },
        ],
      })
    )

    console.log(`published 'order-placed' event into EventBridge`)

    return order
  } catch (e) {
    return internalServerError(e)
  }
}

// demo code, use middleware instead
const internalServerError = (error: unknown) => ({
  statusCode: 500,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ error: String(error) }),
})

const badRequest = (errors: ZodIssue[]) => ({
  statusCode: 400,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ errors }),
})
