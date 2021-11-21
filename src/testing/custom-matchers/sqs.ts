import { z } from 'zod'
import { EOL } from 'os'
import { SQSClient, ReceiveMessageCommand } from '@aws-sdk/client-sqs'
import { poll } from '@/testing/custom-matchers/utils'

const sqsClient = new SQSClient({})

const sqsConfigurationSchema = z.object({
  queueUrl: z.string().nonempty(),
})

const sqsPoller = (queueUrl: string) => async () => {
  const { Messages = [] } = await sqsClient.send(
    new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      WaitTimeSeconds: 20,
    })
  )

  return Messages.map((message) => JSON.parse(message.Body || '{}'))
}

export async function toHaveSQSMessageMatching(
  this: jest.MatcherContext,
  sqsConfiguration: unknown,
  expected: unknown
): Promise<jest.CustomMatcherResult> {
  const configuration = sqsConfigurationSchema.safeParse(sqsConfiguration)

  if (!configuration.success)
    throw new Error(
      `Invalid SQS configuration:${EOL}${configuration.error.message}`
    )

  const { queueUrl } = configuration.data

  const { found } = await poll({
    asyncFn: sqsPoller(queueUrl),
    conditionFn: (messages) =>
      messages.some((message) => this.equals(message, expected)),
  })

  const queueUrlExpected = this.utils.printExpected(queueUrl)
  const printExpected = this.utils.printExpected(expected)
  const hint = this.utils.matcherHint('.toHaveSQSMessage') + EOL + EOL

  return {
    pass: found,
    message: () =>
      `${hint}Expected sqs queue ${queueUrlExpected} to have message matching ${printExpected}`,
  }
}
