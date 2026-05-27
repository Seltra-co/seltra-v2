*** 
About:
Seltra is an AI commerce agent that launches and operates ecommerce businesses from a single prompt.

Users describe a business idea in plain English. Seltra:
creates the storefront, generates products, generates imagery, configures payments, deploys the store, and manages operations.

Our goal is:
-AI-native commerce infrastructure for;
AI-generated businesses,
AI-operated stores,
AI-managed commerce workflows.

Definition of Commerce stack:
-A commerce tech stack is a collection of software, tools, and platforms that power an online retailer’s operations, ranging from frontend user experience to backend inventory, payments, and marketing.
-It includes, the commerce engine, payment processing, tools for marketing, customer support.
Components of a Modern Commerce Stack:
1.Frontend (Experience Layer):The user-facing part (Nextjs)
2.Backend (Application Layer): Handles business logic, including the ecommerce platform (seltra, commercetools allocated), inventory management, and databases.
3.Payment Processing: Secure transaction handlers like Stripe/Paystack
4.Marketing & CRM: Tools for customer engagement, email/SMS marketing, and analytics, such as Klaviyo or Mailchimp
5.Operations & Logistics: Systems for shipping, inventory, and returns.


--------- Canonical Commerce Layer (Core Moat)
* Canonical Schema:
- commerce primary memory infrastructure for seltra agent.
{
  "storeId": "...",
  "businessName": "PixelForge Studios",
  "categories": [...],
  "products": [...],
  "payments": [...],
  "shipping": [...],
  "branding": {...}
}

Efficient - for :
-Portability,
-AI-readable,
-AI-operable commerce memory

The canonical schema allows:
-storefront generation,
-agent operations,
-future analytics,
-future autonomous decisions.

----------- Multi-Tenant Architecture
Each business becomes a tenant.
pixelforge.seltra.store
cozybinary.seltra.store

Architecture:

Wildcard DNS (*.seltra.store)
        ↓
Vercel Edge Middleware
        ↓
Extract Subdomain
        ↓
Fetch Tenant from PostgreSQL
        ↓
Render Dynamic Storefront


----------- Product Generation Pipeline
* Flow:
User Prompt (NLP)
    ↓
Claude (Anthropic LLM) generates:
- products
- descriptions
- pricing
- variants
- tags
- categories
    ↓
fal.ai generates images (product image generation)
    ↓
Images stored in Cloudflare R2 (product image storage)
    ↓
Products stored in PostgreSQL
    ↓
Next.js storefront renders products (UI)


------- AI Image Generation
-Orchestrator for media (fal.ai)

Compared to Replicate:

-faster inference,
-lower latency,
-better DX,
-better startup economics,
-FLUX model quality is excellent.

Seltra uses:
-FLUX product photography models,
-AI lifestyle imagery,
-marketing banners,
-hero images.


----------- Deployment Architecture
Automatic Store Deployment:

Tenant Created
    ↓
Slug Generated
    ↓
Store Saved
    ↓
Vercel Deployment Trigger
    ↓
Subdomain Connected
    ↓
Live Store URL Returned

User receives:

https://brandname.seltra.store

within minutes.

This is one of Seltra’s strongest “magic moments" we are building.



-----------------------------------------------------------------------------
*** 
MVP Goals
***

Phase 1 — Complete Operational Store
Store generated must have:
-dynamic products,
-AI-generated images,
-cart system,
-Paystack checkout (later replace with Stripe),
-order persistence,
-subdomain deployment.


---------------- Scripts
//OLLAMA
ollama --version: 0.24.0

ollama pull qwen2.5:3b