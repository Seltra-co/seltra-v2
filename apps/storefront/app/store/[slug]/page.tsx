// apps/storefront/app/store/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { StoreData } from './types'
import EditorialLayout from './layouts/EditorialLayout'
import GridLayout from './layouts/GridLayout'
import BoldLayout from './layouts/BoldLayout'

const LAYOUTS = {
  editorial: EditorialLayout,
  grid: GridLayout,
  bold: BoldLayout,
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

  // Pick layout based on what the classifier stored, default to grid
  const variant = (store.layoutVariant as keyof typeof LAYOUTS) || 'grid'
  const Layout = LAYOUTS[variant] || GridLayout

  return <Layout store={store} />
}