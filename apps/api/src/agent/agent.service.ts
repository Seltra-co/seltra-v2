import { Injectable } from '@nestjs/common'
import { generateBlueprint, generateProducts } from '@seltra/ai'
import { TenantService } from '../tenant/tenant.service'

@Injectable()
export class AgentService {
  constructor(private readonly tenantService: TenantService) {}

  async buildStore(prompt: string) {
    //Generate blueprint
    const blueprintResult = await generateBlueprint(prompt)
    if (!blueprintResult.success || !blueprintResult.data) {
      return { success: false, error: blueprintResult.error }
    }

    const blueprint = blueprintResult.data

    //Generate products
    const productResult = await generateProducts(blueprint)
    const products = productResult.success ? productResult.products : []

    //Persist to Postgres
    try {
      const tenant = await this.tenantService.createFromBlueprint(
        blueprint,
        products
      )

      //Return success response with store details
      return {
        success: true,
        provider: blueprintResult.provider,
        tenantId: tenant.id,
        storeUrl: `${blueprint.storeSlug}.seltra.store`,
        blueprint,
        products: tenant.products,
        categoriesCreated: tenant.categories.length,
        message: `Store "${blueprint.businessName}" is live at ${blueprint.storeSlug}.seltra.store`,
      }
    } catch (err: unknown) {
      //Handle duplicate slug
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