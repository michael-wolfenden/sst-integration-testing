import { z } from 'zod'

export const orderSchema = z.object({
  orderId: z.string(),
  restaurantName: z.string(),
})

export type Order = z.infer<typeof orderSchema>
