//apps/storefront/app/store/[slug]/page.tsx
import { notFound } from 'next/navigation'
import StorefrontClient from './StorefrontClient'

interface Product {
  id: string
  name: string
  description: string
  price: string
  currency: string
  category: string
  sku: string
  tags: string[]
  status: string
  images: Array<{ url: string; isPrimary: boolean }>
  variants: Array<{ name: string; value: string }>
}

interface StoreData {
  id: string
  name: string
  slug: string
  businessType: string
  targetAudience: string
  storeUrl: string
  canonical: {
    storeFeatures: string[]
    productCategories: string[]
    additionalRecommendations: {
      marketing: string[]
      logistics: string[]
    }
    recommendedTechStack: {
      paymentGateways: string[]
      shippingIntegration: string
    }
  }
  products: Product[]
  categories: Array<{ id: string; name: string }>
  paymentProviders: Array<{ provider: string }>
}

async function getStore(slug: string): Promise<StoreData | null> {
  try {
    const res = await fetch(
      `${process.env.API_URL}/api/v1/seltra/store/${slug}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    const json = await res.json()
    return json.data || json
  } catch {
    return null
  }
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const store = await getStore(slug)
  if (!store) notFound()
  return <StorefrontClient store={store} />
}