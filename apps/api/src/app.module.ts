// apps/api/src/app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AgentModule } from './agent/agent.module'
import { TenantModule } from './tenant/tenant.module'
import { OrdersModule } from './orders/orders.module'
import { HealthModule } from './health/health.module'
import { KeepAliveModule } from './keep-alive/keep-alive.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),   // enables @Cron decorators globally
    AgentModule,
    TenantModule,
    OrdersModule,
    HealthModule,
    KeepAliveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}