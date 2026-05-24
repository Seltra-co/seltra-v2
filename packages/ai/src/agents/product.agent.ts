import { chat } from '../client'
import type { CanonicalStore, GeneratedProduct } from '@seltra/types'

//── Unsplash API — proper fetch, returns images.unsplash.com URLs (no CORS) ──
async function fetchUnsplashUrl(
  productName: string,
  category: string,
): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  //Fallback: deterministic Pollinations URL (no CORS, no key needed)
  const fallback = () => {
    const prompt = encodeURIComponent(
      `Professional product photography, ${productName}, ${category}, clean studio background, soft lighting`
    )
    const seed = productName.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return `https://image.pollinations.ai/prompt/${prompt}?width=600&height=600&model=flux&nologo=true&seed=${seed}`
  }

  if (!accessKey) {
    console.warn('[ImageGen] No UNSPLASH_ACCESS_KEY — using Pollinations fallback')
    return fallback()
  }

  try {
    const clean = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()

    const query = [
      ...clean(productName).split(' ').slice(0, 2),
      clean(category).split(' ')[0],
    ]
      .filter(Boolean)
      .filter((w, i, arr) => arr.indexOf(w) === i)
      .join(' ')

    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=squarish&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
      }
    )

    if (!res.ok) {
      console.warn(`[Unsplash] ${res.status} for "${query}" — using fallback`)
      return fallback()
    }

    const data = await res.json()
    //Use the regular size — good quality, not too large
    return data.urls?.regular || data.urls?.small || fallback()
  } catch (err) {
    console.warn('[Unsplash] fetch failed — using fallback:', err)
    return fallback()
  }
}

// ── System prompt ──────────────────────────────────────────────────────────
const PRODUCT_SYSTEM_PROMPT = `You are Seltra's Product Generator AI.
Given a store blueprint, generate a realistic product catalog.

Rules:
1. Generate exactly 8 products.
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

  //Generate product catalog
  const llmResult = await chat([
    {
      role: 'user',
      content:
        `${PRODUCT_SYSTEM_PROMPT}\n\n` +
        `Store: ${blueprint.businessName}\n` +
        `Type: ${blueprint.businessType}\n` +
        `Target Audience: ${blueprint.targetAudience}\n` +
        `Categories: ${blueprint.productCategories.join(', ')}\n\n` +
        `Generate 8 realistic products for this store.`,
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

  //Fetch Unsplash images in parallel (3 at a time to stay within rate limits)
  console.log(`[ProductAgent] Fetching Unsplash images for ${rawProducts.length} products...`)

  const imageUrls: string[] = []
  const batchSize = 3

  for (let i = 0; i < rawProducts.length; i += batchSize) {
    const batch = rawProducts.slice(i, i + batchSize)
    const batchUrls = await Promise.all(
      batch.map(p => fetchUnsplashUrl(p.name, p.category))
    )
    imageUrls.push(...batchUrls)
    //Small delay between batches to respect rate limits
    if (i + batchSize < rawProducts.length) {
      await new Promise(r => setTimeout(r, 200))
    }
  }

  //Merge images into products
  const productsWithImages = rawProducts.map((product, i) => ({
    ...product,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    images: [{ url: imageUrls[i], isPrimary: true }],
  }))

  const generated = productsWithImages.filter(p => p.images[0]?.url).length
  console.log(`[ProductAgent] Done — ${generated}/${rawProducts.length} images fetched`)

  return {
    success: true,
    products: productsWithImages,
    provider: llmResult.provider,
    imageStats: { total: rawProducts.length, generated, failed: rawProducts.length - generated },
    error: null,
  }
}