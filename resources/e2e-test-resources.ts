import * as sst from '@serverless-stack/resources'
import * as events from '@aws-cdk/aws-events'
import { Duration } from '@aws-cdk/core'
import { Stack } from '@resources/Stack'
import { Queue } from '@serverless-stack/resources'

export const createE2ETestResources = (stack: Stack, bus: sst.EventBus) => {
  const queue = new Queue(stack, 'e2e-test-queue', {
    sqsQueue: {
      retentionPeriod: Duration.seconds(60),
      visibilityTimeout: Duration.seconds(1),
    },
  })

  bus.addRules(stack, {
    rule: {
      eventPattern: { source: ['sst-testing'] },
      targets: [
        {
          queue,
          targetProps: {
            message: events.RuleTargetInput.fromObject({
              eventBusName: bus.eventBusName,
              source: events.EventField.fromPath('$.source'),
              ['detail-type']: events.EventField.fromPath('$.detail-type'),
              detail: events.EventField.fromPath('$.detail'),
            }),
          },
        },
      ],
    },
  })

  stack.addOutputsToSSM({
    E2E_TEST_QUEUE_URL: queue.sqsQueue.queueUrl,
  })
}
