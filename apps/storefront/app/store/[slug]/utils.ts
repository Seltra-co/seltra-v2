// apps/storefront/app/store/[slug]/utils.ts
import type { Product } from './types'

export function getVariantGroups(product: Product): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  product.variants.forEach((v) => {
    if (!groups[v.name]) groups[v.name] = []
    if (!groups[v.name].includes(v.value)) groups[v.name].push(v.value)
  })
  return groups
}