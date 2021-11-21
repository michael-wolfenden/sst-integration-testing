import { z } from 'zod'
import { EOL } from 'os'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument, GetCommand } from '@aws-sdk/lib-dynamodb'
import { poll } from '@/testing/custom-matchers/utils'

const documentClient = DynamoDBDocument.from(new DynamoDBClient({}))

const dynamoDBConfigurationSchema = z.object({
  table: z.string().nonempty(),
  key: z.record(z.string(), z.string()),
})

type DynamoDBConfigurationSchema = z.infer<typeof dynamoDBConfigurationSchema>

const dynamoDBPoller =
  ({ table, key }: DynamoDBConfigurationSchema) =>
  async () => {
    const { Item } = await documentClient.send(
      new GetCommand({
        TableName: table,
        Key: key,
      })
    )

    return Item
  }

export async function toHaveDynamoDBRecordMatching(
  this: jest.MatcherContext,
  dynamoDBConfiguration: unknown,
  expected: unknown
): Promise<jest.CustomMatcherResult> {
  const configuration = dynamoDBConfigurationSchema.safeParse(
    dynamoDBConfiguration
  )

  if (!configuration.success)
    throw new Error(
      `Invalid DynamoDB configuration:${EOL}${configuration.error.message}`
    )

  const { found } = await poll({
    asyncFn: dynamoDBPoller(configuration.data),
    conditionFn: (record) => this.equals(record, expected),
  })

  const { table, key } = configuration.data

  const tableExpected = this.utils.printExpected(table)
  const keyExpected = this.utils.printExpected(key)
  const printExpected = this.utils.printExpected(expected)

  const hint = this.utils.matcherHint('.toHaveSQSMessage') + EOL + EOL

  return {
    pass: found,
    message: () =>
      `${hint}Expected dynamoDB table ${tableExpected} to have record matching ${printExpected} for key ${keyExpected}`,
  }
}
