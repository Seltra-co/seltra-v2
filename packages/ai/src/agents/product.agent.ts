import { chat } from '../client'
import type { CanonicalStore, GeneratedProduct } from '@seltra/types'

// ── Image URL builder: Pexels → Pixabay → Picsum ────────────────────────────
async function buildImageUrl(productName: string, category: string): Promise<string> {
  const query = `${category} ${productName}`.trim()

  // ── 1. Pexels ──────────────────────────────────────────────────────────────
  const pexelsKey = process.env.PEXELS_API_KEY
  if (pexelsKey) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&page=1`,
        { headers: { Authorization: pexelsKey } }
      )
      if (res.ok) {
        const data = await res.json()
        const url = data.photos?.[0]?.src?.medium
        if (url) return url
      }
    } catch {
      console.warn(`[ProductAgent] Pexels failed for "${query}", trying Pixabay...`)
    }
  }

  // ── 2. Pixabay ─────────────────────────────────────────────────────────────
  const pixabayKey = process.env.PIXABAY_API_KEY
  if (pixabayKey) {
    try {
      const res = await fetch(
        `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3&safesearch=true`
      )
      if (res.ok) {
        const data = await res.json()
        const url = data.hits?.[0]?.webformatURL
        if (url) return url
      }
    } catch {
      console.warn(`[ProductAgent] Pixabay failed for "${query}", falling back to Picsum...`)
    }
  }

  // ── 3. Picsum (deterministic fallback — always works, no key needed) ───────
  const seed = productName
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return `https://picsum.photos/seed/${seed}/512/512`
}

const PRODUCT_SYSTEM_PROMPT = `You are Seltra's Product Generator AI.
Given a store blueprint, generate a realistic product catalog.

Rules:
1. Generate exactly 6 products.
2. Return ONLY a valid JSON array. No markdown, no explanation, no code blocks.
3. Use GHS (Ghanaian Cedi) as the currency.
4. Prices must be realistic for the Ghanaian/African market.
5. Each product must follow this exact structure:

[
  {
    "name": "string",
    "description": "string (2-3 sentences of compelling product copy)",
    "price": number,
    "currency": "GHS",
    "category": "string (must match one of the store's productCategories)",
    "sku": "string (e.g. SKU-001)",
    "tags": ["string", "string"],
    "variants": [
      { "name": "Size", "value": "Small" },
      { "name": "Size", "value": "Medium" },
      { "name": "Size", "value": "Large" }
    ]
  }
]`

function cleanJSON(raw: string): string {
  let s = raw.trim()
  if (s.startsWith('```json')) s = s.slice(7)
  else if (s.startsWith('```')) s = s.slice(3)
  if (s.endsWith('```')) s = s.slice(0, -3)
  return s.trim()
}

export async function generateProducts(blueprint: CanonicalStore): Promise<{
  success: boolean
  products: GeneratedProduct[]
  provider: string
  imageStats: { total: number; generated: number; failed: number }
  error: string | null
}> {
  const FAILED = (provider: string, error: string) => ({
    success: false,
    products: [],
    provider,
    imageStats: { total: 0, generated: 0, failed: 0 },
    error,
  })

  const llmResult = await chat([
    {
      role: 'user',
      content:
        `${PRODUCT_SYSTEM_PROMPT}\n\n` +
        `Store: ${blueprint.businessName}\n` +
        `Type: ${blueprint.businessType}\n` +
        `Target Audience: ${blueprint.targetAudience}\n` +
        `Categories: ${blueprint.productCategories.join(', ')}\n\n` +
        `Generate 6 realistic products for this store.`,
    },
  ])

  let rawProducts: GeneratedProduct[]
  try {
    rawProducts = JSON.parse(cleanJSON(llmResult.content))
    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return FAILED(llmResult.provider, 'LLM returned empty or non-array product list')
    }
  } catch {
    return FAILED(
      llmResult.provider,
      'Failed to parse product JSON: ' + cleanJSON(llmResult.content).slice(0, 200),
    )
  }

  console.log(`[ProductAgent] Building image URLs for ${rawProducts.length} products...`)

  // Build image URLs concurrently
  const imageUrls = await Promise.all(
    rawProducts.map((p) => buildImageUrl(p.name, p.category))
  )

  const productsWithImages = rawProducts.map((product, i) => ({
    ...product,
    price:
      typeof product.price === 'string'
        ? parseFloat(product.price)
        : product.price,
    images: [{
      url: imageUrls[i],
      isPrimary: true,
    }],
  }))

  console.log(`[ProductAgent] Done — ${rawProducts.length}/${rawProducts.length} image URLs built`)

  return {
    success: true,
    products: productsWithImages,
    provider: llmResult.provider,
    imageStats: {
      total: rawProducts.length,
      generated: rawProducts.length,
      failed: 0,
    },
    error: null,
  }
}