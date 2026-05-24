// apps/storefront/app/store/[slug]/types.ts

export interface ProductVariant {
  id?: string
  name: string
  value: string
}

export interface ProductImage {
  id?: string
  url: string
  isPrimary?: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  price: string
  currency: string
  category: string
  sku: string
  tags: string[]
  status?: string
  images: ProductImage[]
  variants: ProductVariant[]
}

export interface StoreData {
  id: string
  name: string
  slug: string
  businessType: string
  targetAudience: string
  storeUrl?: string
  layoutVariant?: 'editorial' | 'grid' | 'bold'
  canonical: {
    storeFeatures: string[]
    productCategories: string[]
    recommendedTechStack: {
      paymentGateways: string[]
      shippingIntegration: string
    }
    additionalRecommendations: {
      logistics: string[]
      marketing?: string[]
    }
  }
  products: Product[]
  categories: Array<{ id: string; name: string }>
  paymentProviders: Array<{ provider: string; config?: Record<string, unknown> }>
}

export interface CartItem {
  product: Product
  quantity: number
}