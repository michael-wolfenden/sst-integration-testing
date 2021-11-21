/* eslint-disable @typescript-eslint/no-namespace */
import { toHaveSQSMessageMatching } from './sqs'
import { toHaveDynamoDBRecordMatching } from './dynamodb'

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveSQSMessageMatching<E>(expected: E): R
      toHaveDynamoDBRecordMatching<E>(expected: E): R
    }
  }
}

expect.extend({
  toHaveSQSMessageMatching,
  toHaveDynamoDBRecordMatching,
})

jest.setTimeout(60_000)
