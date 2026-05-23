# Seltra TS Migration Execution Plan

Date: 2026-05-22

## Findings

Old repository (Seltra.zip)
- Large mixed architecture with Python AI services, storefront templates, deployment infrastructure, and legacy components.
- AI orchestration currently centered around:
  - Intent Parser
  - Product Generator
  - Brand Engine
  - Image Generator
  - Payment Setup
  - Storefront Deploy
  - Live Store

New repository (seltra.zip)
- Monorepo structure:
  - apps/api
  - apps/web
  - packages/ai
  - packages/db
  - packages/types
  - packages/ui
  - docs
  - infrastructure

## Target Architecture

apps/
  api/          NestJS Backend
  web/          Next.js Storefront + Admin

packages/
  ai/           Agent Graph + AI Workflows
  db/           Prisma + PostgreSQL
  types/        Shared Contracts
  ui/           Shared Components

infrastructure/
  deployment/
  scripts/
  vercel/

## Week 1 — Core Commerce Engine

### Backend Foundation
- Rewrite backend services into NestJS
- Configure Prisma
- Configure PostgreSQL
- Configure module boundaries

### Shared Types
- Tenant
- Product
- Variant
- Category
- Store
- Order
- Payment

### Product Domain
- Product schema
- Category schema
- Variant schema
- Product image schema

### APIs
- Create Product
- Update Product
- Delete Product
- List Products
- Tenant Product APIs

Deliverable:
- Multi-tenant product CRUD operational

## Week 2 — Tenant Architecture

- Tenant resolution
- Subdomain middleware
- Tenant onboarding
- Store creation
- Canonical commerce schema

Deliverable:
- tenant.seltra.store resolves correctly

## Week 3 — AI Layer

packages/ai

- Intent Parser
- Product Generator
- Brand Engine
- Image Generator

Deliverable:
- Prompt -> Product Catalog

## Week 4 — Storefront Generation

apps/web

- Dynamic storefront
- Product pages
- Cart
- Checkout flow

Deliverable:
- Functional generated store

## Week 5 — Payments

- Paystack integration
- Webhooks
- Order persistence

Deliverable:
- End-to-end checkout

## Week 6 — Deployment Automation

- Vercel deployment pipeline
- Wildcard domain
- Store provisioning

Deliverable:
- Auto-generated live stores

## Suggested NestJS Modules

src/modules

- auth
- tenants
- stores
- products
- categories
- orders
- payments
- ai
- deployments

## Immediate Priority

1. NestJS backend rewrite
2. Shared package contracts
3. Product schema
4. Tenant product APIs
5. Canonical commerce model
6. Prisma migrations
