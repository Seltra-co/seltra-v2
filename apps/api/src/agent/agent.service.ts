//apps/api/src/agent/agent.service.ts
import { Injectable } from '@nestjs/common'
import { generateBlueprint, generateProducts, classifyLayout } from '@seltra/ai'
import { TenantService } from '../tenant/tenant.service'

@Injectable()
export class AgentService {
  constructor(private readonly tenantService: TenantService) {}

  async buildStore(prompt: string) {
    // 1. Generate blueprint
    const blueprintResult = await generateBlueprint(prompt)
    if (!blueprintResult.success || !blueprintResult.data) {
      return { success: false, error: blueprintResult.error }
    }

    const blueprint = blueprintResult.data

    // 2. Classify layout variant (runs concurrently with product generation)
    const [productResult, layoutResult] = await Promise.all([
      generateProducts(blueprint),
      classifyLayout(blueprint),
    ])

    const products = productResult.success ? productResult.products : []

    // 3. Persist to Postgres with layout variant
    try {
      const tenant = await this.tenantService.createFromBlueprint(
        blueprint,
        products,
        layoutResult.variant,
      )

      return {
        success: true,
        provider: blueprintResult.provider,
        tenantId: tenant.id,
        storeUrl: `${blueprint.storeSlug}.seltra.store`,
        layoutVariant: layoutResult.variant,
        blueprint,
        products: tenant.products,
        categoriesCreated: tenant.categories.length,
        message: `Store "${blueprint.businessName}" is live at ${blueprint.storeSlug}.seltra.store`,
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error.code === 'P2002') {
        return {
          success: false,
          error: `A store with slug "${blueprint.storeSlug}" already exists. Try a different store name.`,
        }
      }
      throw err
    }
  }
}