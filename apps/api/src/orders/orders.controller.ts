//apps/api/src/orders/orders.controller.ts
import { Controller, Post, Body, HttpCode } from '@nestjs/common'
import { OrdersService } from './orders.service'

class VerifyOrderDto {
  reference!: string
  tenantId!: string
  customerEmail!: string
  customerName!: string
  cart!: Array<{ product: { id: string; name: string; price: string }; quantity: number }>
  totalAmount!: number
  currency!: string
}

@Controller('api/v1/seltra/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('verify')
  @HttpCode(200)
  verify(@Body() body: VerifyOrderDto) {
    return this.ordersService.verifyAndSave(body)
  }
}