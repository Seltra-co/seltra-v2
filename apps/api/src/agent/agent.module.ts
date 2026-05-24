//apps/api/src/agent/agent.module.ts
import { Module } from '@nestjs/common'
import { AgentController } from './agent.controller'
import { AgentService } from './agent.service'
import { TenantModule } from '../tenant/tenant.module'

@Module({
  imports: [TenantModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}