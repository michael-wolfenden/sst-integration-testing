import { EventBus } from '@serverless-stack/resources'
import { Stack } from '@resources/Stack'

export const createBus = (stack: Stack) =>
  new EventBus(stack, 'bus', {
    eventBridgeEventBus: {
      eventBusName: stack.logicalPrefixedName('order-events'),
    },
  })
