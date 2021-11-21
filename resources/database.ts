import * as sst from '@serverless-stack/resources'
import * as cdk from '@aws-cdk/core'
import * as dynamodb from '@aws-cdk/aws-dynamodb'

import { Stack } from '@resources/Stack'

export const createDatabase = (
  stack: Stack,
  removalPolicy: cdk.RemovalPolicy
) =>
  new sst.Table(stack, 'table', {
    fields: {
      name: sst.TableFieldType.STRING,
    },
    primaryIndex: { partitionKey: 'name' },
    dynamodbTable: {
      removalPolicy: removalPolicy,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    },
  })
