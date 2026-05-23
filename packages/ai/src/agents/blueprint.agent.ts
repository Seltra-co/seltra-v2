import { chat } from '../client'

const SYSTEM_PROMPT = `You are Seltra's Store Builder AI.
Given a user description of a business, design a comprehensive store blueprint.

Rules:
1. Always set platform to "Seltra" — never suggest Shopify, WooCommerce, or any other platform.
2. Return ONLY valid JSON. No markdown, no explanation, no code blocks.
3. Use Paystack as the default payment gateway for African stores. Add others where relevant.
4. Fill missing information with smart, context-aware defaults.
5. The JSON must follow this exact structure:

{
  "platform": "Seltra",
  "businessName": "string",
  "businessType": "string",
  "targetAudience": "string",
  "productCategories": ["string"],
  "storeFeatures": ["string"],
  "recommendedTechStack": {
    "paymentGateways": ["string"],
    "shippingIntegration": "string",
    "frontend": "Next.js with TailwindCSS",
    "backend": "Node.js with NestJS",
    "database": "PostgreSQL",
    "analytics": "string"
  },
  "additionalRecommendations": {
    "marketing": ["string"],
    "customerService": ["string"],
    "logistics": ["string"],
    "growthStrategy": ["string"]
  },
  "storeSlug": "string (url-friendly lowercase hyphenated version of businessName)",
  "estimatedLaunchTime": "string (e.g. '15 minutes')"
}`

function cleanJSON(raw: string): string {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
  return cleaned.trim()
}

function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function generateBlueprint(userPrompt: string) {
  const result = await chat([
    {
      role: 'user',
      content: `${SYSTEM_PROMPT}\n\nUser prompt:\n${userPrompt}`
    }
  ])

  const cleaned = cleanJSON(result.content)

  try {
    const parsed = JSON.parse(cleaned)

    // Enforce non-negotiables regardless of what the model returns
    parsed.platform = 'Seltra'
    parsed.recommendedTechStack.frontend = 'Next.js with TailwindCSS'
    parsed.recommendedTechStack.backend = 'Node.js with NestJS'
    parsed.recommendedTechStack.database = 'PostgreSQL'
    parsed.estimatedLaunchTime = parsed.estimatedLaunchTime ?? '15 minutes'

    // Auto-generate slug if model didn't return one
    if (!parsed.storeSlug && parsed.businessName) {
      parsed.storeSlug = generateSlug(parsed.businessName)
    }

    return {
      success: true,
      prompt: userPrompt,
      data: parsed,
      provider: result.provider,
      error: null
    }
  } catch {
    return {
      success: false,
      prompt: userPrompt,
      data: null,
      provider: result.provider,
      error: 'Failed to parse AI output — raw: ' + cleaned.slice(0, 200)
    }
  }
}