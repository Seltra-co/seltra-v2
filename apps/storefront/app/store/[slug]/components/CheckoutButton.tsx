//apps/storefront/app/store/[slug]/components/CheckoutButton.tsx
'use client'

import { useState } from 'react'
import { ArrowRight, Loader } from 'lucide-react'
import type { CartItem, StoreData } from '../types'

interface CheckoutButtonProps {
  cart: CartItem[]
  store: StoreData
  currency: string
  totalAmount: number
  accentColor: string
  accentFg: string
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string
        email: string
        amount: number
        currency: string
        ref: string
        metadata: Record<string, unknown>
        callback: (response: { reference: string }) => void
        onClose: () => void
      }) => { openIframe: () => void }
    }
  }
}

const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.PaystackPop) { resolve(); return }

    // Script tag already in DOM but still loading
    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Paystack script failed')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => {
      // Give it 100ms to initialize PaystackPop on window
      setTimeout(() => {
        if (window.PaystackPop) resolve()
        else reject(new Error('PaystackPop not available after load'))
      }, 100)
    }
    script.onerror = () => reject(new Error('Failed to load Paystack script'))
    document.head.appendChild(script)
  })
}

export function CheckoutButton({
  cart, store, currency, totalAmount, accentColor, accentFg
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState<'idle' | 'collect' | 'paying'>('idle')
  const [error, setError] = useState<string | null>(null)

  //Paystack expects amount in lowest currency unit (pesewas for GHS)
  const amountInPesewas = Math.round(totalAmount * 100)

  const generateRef = () =>
    `seltra_${store.slug}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

  const handlePay = async () => {
    if (!email || !name) return
    setLoading(true)
    setError(null)

    try {
      await loadPaystackScript()

      if (!window.PaystackPop) {
        throw new Error('Paystack not available')
      }

      const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
      if (!key) {
        throw new Error('Paystack public key is not set in NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY')
      }

      const ref = generateRef()

      const handler = window.PaystackPop.setup({
  key,
  email,
  amount: amountInPesewas,
  currency: currency === 'GHS' ? 'GHS' : 'NGN',
  ref,
  metadata: {
    custom_fields: [
      { display_name: 'Customer Name', variable_name: 'customer_name', value: name },
      { display_name: 'Store', variable_name: 'store_slug', value: store.slug },
      { display_name: 'Store ID', variable_name: 'tenant_id', value: store.id },
    ],
    cart: cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    })),
  },
  //Plain function — NOT async, Paystack validates this strictly
  callback: function(response: { reference: string }) {
    setStep('idle')
    setLoading(false)
    // Fire verification in background without awaiting inside callback
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/orders/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: response.reference,
        tenantId: store.id,
        customerEmail: email,
        customerName: name,
        cart,
        totalAmount,
        currency,
      }),
    }).catch(() => {}) // non-blocking, webhook handles it too
    alert(`✅ Payment successful!\nRef: ${response.reference}`)
  },
    onClose: function() {
        setStep('collect')
        setLoading(false)
    },
    })

      setStep('paying')
      handler.openIframe()

    } catch (err) {
      console.error('[Paystack]', err)
      setError(
        err instanceof Error && err.message.includes('key')
          ? 'Paystack key missing — check NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in .env.local'
          : 'Payment failed to load. Please try again.'
      )
      setStep('collect')
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${accentColor}55`,
    color: '#e5e7eb',
    padding: '11px 14px',
    borderRadius: 6,
    fontSize: 13,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('collect')}
        style={{
          width: '100%', background: accentColor, color: accentFg,
          border: 'none', padding: '14px', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Checkout with Paystack <ArrowRight size={16} />
      </button>
    )
  }

  if (step === 'collect') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {error && (
          <p style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', margin: 0 }}>
            {error}
          </p>
        )}

        <input
          id="checkout-name"
          name="name"
          type="text"
          placeholder="Your full name"
          autoComplete="name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          id="checkout-email"
          name="email"
          type="email"
          placeholder="Email for receipt"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={handlePay}
          disabled={!email || !name || loading}
          style={{
            width: '100%',
            background: email && name && !loading ? accentColor : '#333',
            color: email && name && !loading ? accentFg : '#555',
            border: 'none', padding: '14px', fontSize: 14, fontWeight: 700,
            cursor: email && name && !loading ? 'pointer' : 'not-allowed',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.2s',
          }}
        >
          {loading
            ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
            : <>Pay GHS {totalAmount.toFixed(2)} <ArrowRight size={16} /></>
          }
        </button>

        <button
          onClick={() => { setStep('idle'); setError(null) }}
          style={{
            background: 'none', border: 'none', color: '#555',
            fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0,
          }}
        >
          ← Back
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // paying state — Paystack iframe is open
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 10 }}>
      <Loader size={16} color={accentColor} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: 13, color: '#888' }}>Opening Paystack...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}