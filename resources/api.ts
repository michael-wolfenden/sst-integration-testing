import * as sst from '@serverless-stack/resources'
import * as iam from '@aws-cdk/aws-iam'
import * as lambda from '@aws-cdk/aws-lambda'
import { Stack } from '@resources/Stack'

export const createApi = (
  stack: Stack,
  table: sst.Table,
  bus: sst.EventBus
) => {
  return new sst.Api(stack, 'api', {
    defaultFunctionProps: {
      runtime: lambda.Runtime.NODEJS_14_X,
      architecture: lambda.Architecture.ARM_64,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
    },

    routes: {
      'POST /orders': {
        function: {
          functionName: stack.logicalPrefixedName('place-order'),
          handler: `src/functions/place-order.handler`,
          environment: {
            TABLE_NAME: table.tableName,
            BUS_NAME: bus.eventBusName,
          },
          permissions: [
            new iam.PolicyStatement({
              actions: ['dynamodb:PutItem'],
              effect: iam.Effect.ALLOW,
              resources: [table.tableArn],
            }),
            new iam.PolicyStatement({
              actions: ['events:PutEvents'],
              effect: iam.Effect.ALLOW,
              resources: [bus.eventBusArn],
              conditions: {
                StringEquals: {
                  'events:detail-type': 'order-placed',
                  'events:source': 'sst-testing',
                },
              },
            }),
          ],
        },
      },
    },
  })
}
