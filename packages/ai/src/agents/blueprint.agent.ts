import { chat } from '../client'
import type { CanonicalStore } from '@seltra/types'

//Core agent workflow (seltra blueprint agent):
//1. User provides a prompt describing their business idea.
//2. The agent uses a carefully crafted system prompt to instruct the AI to generate a detailed store blueprint in JSON format.
//3. The agent parses the AI's response, enforcing non-negotiable requirements (like always using "Seltra" as the platform) and filling in any missing information with smart defaults.
//4. The final blueprint is returned to the user, ready to be used for store creation.



const SYSTEM_PROMPT = `You are Seltra's Store Builder AI.
Given a user description of a business, design a comprehensive store blueprint.

Rules:
1. Always set platform to "Seltra". Never suggest Shopify, WooCommerce, or any other platform.
2. Return ONLY valid JSON. No markdown, no explanation, no code blocks.
3. Use Paystack as the default payment gateway for African stores.
4. Fill missing information with smart context-aware defaults.
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
  "storeSlug": "url-friendly-lowercase-hyphenated-business-name",
  "estimatedLaunchTime": "15 minutes"
}`

function cleanJSON(raw: string): string {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
  return cleaned.trim()
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function generateBlueprint(userPrompt: string): Promise<{
  success: boolean
  prompt: string
  data: CanonicalStore | null
  provider: string
  error: string | null
}> {
  const result = await chat([
    {
      role: 'user',
      content: `${SYSTEM_PROMPT}\n\nUser prompt:\n${userPrompt}`,
    },
  ])

  const cleaned = cleanJSON(result.content)

  try {
    const parsed = JSON.parse(cleaned)

    // Enforce non-negotiables
    parsed.platform = 'Seltra'
    parsed.recommendedTechStack.frontend = 'Next.js with TailwindCSS'
    parsed.recommendedTechStack.backend = 'Node.js with NestJS'
    parsed.recommendedTechStack.database = 'PostgreSQL'
    parsed.estimatedLaunchTime = parsed.estimatedLaunchTime ?? '15 minutes'

    if (!parsed.storeSlug && parsed.businessName) {
      parsed.storeSlug = generateSlug(parsed.businessName)
    }

    return {
      success: true,
      prompt: userPrompt,
      data: parsed as CanonicalStore,
      provider: result.provider,
      error: null,
    }
  } catch {
    return {
      success: false,
      prompt: userPrompt,
      data: null,
      provider: result.provider,
      error: 'Failed to parse AI output: ' + cleaned.slice(0, 200),
    }
  }
}