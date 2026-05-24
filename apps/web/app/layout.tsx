//apps/web/app/layout.tsx
import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'Seltra — Commerce that runs itself',
  description: 'Launch a full storefront today — our specialized agents handle operations, marketing, payments, and fulfillment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a]">{children}</body>
    </html>
  )
}