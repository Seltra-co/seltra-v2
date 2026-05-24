//apps/api/src/agent/agent.controller.ts
import { Controller, Post, Body, HttpCode, Get } from '@nestjs/common'
import { AgentService } from './agent.service'

class BuildStoreDto {
  prompt!: string
}

@Controller('api/v1/seltra/agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('build')
  @HttpCode(200)
  buildStore(@Body() body: BuildStoreDto) {
    return this.agentService.buildStore(body.prompt)
  }
}