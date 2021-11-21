import * as sst from '@serverless-stack/resources'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import { Stack } from '@resources/Stack'

export const createDatabase = (stack: Stack) =>
  new sst.Table(stack, 'table', {
    fields: {
      orderId: sst.TableFieldType.STRING,
    },
    primaryIndex: { partitionKey: 'orderId' },
    dynamodbTable: {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    },
  })
