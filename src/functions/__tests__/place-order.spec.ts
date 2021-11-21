import { loadEnv, str } from '@/lib/env'
import { invoke } from '@/testing'
import { Order } from '@/types'
import faker from 'faker'

const env = loadEnv({
  TABLE_NAME: str(),
  BUS_NAME: str(),
  E2E_TEST_QUEUE_URL: str(),
})

const callPlaceOrder = async (postData: Partial<Order>) =>
  await invoke.viaHttp('/orders', 'POST', JSON.stringify(postData))

test('persists the order', async () => {
  jest.setTimeout(30_000)

  const order: Order = {
    orderId: faker.datatype.uuid(),
    restaurantName: faker.random.alphaNumeric(10),
  }

  const response = await callPlaceOrder(order)

  expect(response).toMatchObject({
    body: order,
    statusCode: 200,
  })

  await expect({
    table: env.TABLE_NAME,
    key: { orderId: order.orderId },
  }).toHaveDynamoDBRecordMatching(order)

  await expect({
    queueUrl: env.E2E_TEST_QUEUE_URL,
  }).toHaveSQSMessageMatching({
    eventBusName: env.BUS_NAME,
    source: 'sst-testing',
    'detail-type': 'order-placed',
    detail: order,
  })
})

test('validates the posted data', async () => {
  const invalidPostData = {}
  const response = await callPlaceOrder(invalidPostData)

  expect(response).toMatchInlineSnapshot(`
Object {
  "body": Object {
    "errors": Array [
      Object {
        "code": "invalid_type",
        "expected": "string",
        "message": "Required",
        "path": Array [
          "orderId",
        ],
        "received": "undefined",
      },
      Object {
        "code": "invalid_type",
        "expected": "string",
        "message": "Required",
        "path": Array [
          "restaurantName",
        ],
        "received": "undefined",
      },
    ],
  },
  "statusCode": 400,
}
`)
})
