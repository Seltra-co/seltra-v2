//apps/api/src/tenant/tenant.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { prisma } from '@seltra/db'
import type { CanonicalStore, GeneratedProduct } from '@seltra/types'

@Injectable()
export class TenantService {

  async createFromBlueprint(
    blueprint: CanonicalStore,
    products: GeneratedProduct[],
    layoutVariant: 'editorial' | 'grid' | 'bold' = 'grid',
  ) {
    const tenant = await prisma.tenant.create({
      data: {
        name: blueprint.businessName,
        slug: blueprint.storeSlug,
        businessType: blueprint.businessType,
        targetAudience: blueprint.targetAudience,
        platform: 'Seltra',
        status: 'active',
        canonical: {
          ...(blueprint as object),
          layoutVariant, // store inside canonical JSON too for easy access
        },
        storeUrl: `${blueprint.storeSlug}.seltra.store`,

        categories: {
          create: blueprint.productCategories.map((name) => ({ name })),
        },

        paymentProviders: {
          create: blueprint.recommendedTechStack.paymentGateways.map((provider) => ({
            provider,
            config: {},
          })),
        },

        products: {
          create: products.map((p) => ({
            name: p.name,
            description: p.description,
            price: p.price,
            currency: p.currency || 'GHS',
            category: p.category,
            sku: p.sku,
            tags: p.tags as object,
            status: 'active',
            images: {
              create: (p.images ?? []).map((img) => ({
                url: img.url,
                isPrimary: img.isPrimary ?? true,
              })),
            },
            variants: {
              create: p.variants.map((v) => ({
                name: v.name,
                value: v.value,
              })),
            },
          })),
        },
      },
      include: {
        categories: true,
        products: { include: { variants: true, images: true } },
        paymentProviders: true,
      },
    })

    return tenant
  }

  async findBySlug(slug: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            images: true,
            variants: true,
          },
        },
        categories: true,
        paymentProviders: true,
        shippingZones: true,
      },
    })

    if (!tenant) throw new NotFoundException(`Store "${slug}" not found`)

    // Extract layoutVariant from canonical JSON for storefront to consume
    const canonical = tenant.canonical as Record<string, unknown>
    const layoutVariant = (canonical?.layoutVariant as string) || 'grid'

    return {
      success: true,
      message: `Store "${tenant.name}" found`,
      data: {
        ...tenant,
        layoutVariant,
      },
    }
  }

  async findAll() {
    return prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        businessType: true,
        storeUrl: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}