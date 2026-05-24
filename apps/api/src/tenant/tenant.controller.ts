//apps/api/src/tenant/tenant.controller.ts
import { Controller, Get, Param } from '@nestjs/common'
import { TenantService } from './tenant.service'

@Controller('api/v1/seltra/store')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  findAll() {
    return this.tenantService.findAll()
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.tenantService.findBySlug(slug)
  }
}