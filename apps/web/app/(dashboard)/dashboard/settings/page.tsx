//apps/web/app/(dashboard)/dashboard/settings/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Settings, Store, CreditCard, Bell, Globe, Save } from 'lucide-react'
import { Spinner, Badge } from '@/components/ui'

interface StoreSettings {
  name: string
  slug: string
  businessType: string
  targetAudience: string
  storeUrl: string
  paystackPublicKey: string
  paystackSecretKey: string
  customDomain: string
}

type Tab = 'store' | 'payments' | 'notifications' | 'domain'

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('store')
  const [settings, setSettings] = useState<StoreSettings>({
    name: '',
    slug: '',
    businessType: '',
    targetAudience: '',
    storeUrl: '',
    paystackPublicKey: '',
    paystackSecretKey: '',
    customDomain: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { loadSettings() }, [])

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('seltra_session') || '{}')?.token }
    catch { return null }
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      const store = (window as any).__seltra_active_store
      if (!store?.slug) { setLoading(false); return }

      const token = getToken()
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/store/${store.slug}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      const data = await res.json()
      const s = data.data || data

      setSettings({
        name: s.name || '',
        slug: s.slug || '',
        businessType: s.businessType || '',
        targetAudience: s.targetAudience || '',
        storeUrl: s.storeUrl || `${s.slug}.seltra.store`,
        paystackPublicKey: s.paymentProviders?.[0]?.config?.publicKey || '',
        paystackSecretKey: '',
        customDomain: s.customDomain || '',
      })
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const store = (window as any).__seltra_active_store
      const token = getToken()

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/store/${store?.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: settings.name,
            businessType: settings.businessType,
            targetAudience: settings.targetAudience,
          }),
        }
      )

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'store', label: 'Store', icon: <Store size={14} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={14} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
    { id: 'domain', label: 'Domain', icon: <Globe size={14} /> },
  ]

  const Field = ({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    readOnly = false,
    hint,
  }: {
    label: string
    value: string
    onChange?: (v: string) => void
    placeholder?: string
    type?: string
    readOnly?: boolean
    hint?: string
  }) => (
    <div>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        className="input-base"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        style={readOnly ? { opacity: 0.5, cursor: 'default' } : {}}
      />
      {hint && (
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 5, lineHeight: 1.5 }}>{hint}</p>
      )}
    </div>
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '0 24px', height: 52, borderBottom: '1px solid #141414',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Settings size={16} color="var(--green)" />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Settings</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: saved ? '#0a1f0a' : 'var(--green)',
            color: saved ? 'var(--green)' : '#000',
            border: `1px solid ${saved ? 'var(--green-border)' : 'transparent'}`,
            padding: '7px 16px', borderRadius: 8, fontSize: 12,
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          {saving
            ? <><Spinner size={13} color="#000" /> Saving...</>
            : saved
            ? '✓ Saved'
            : <><Save size={13} /> Save changes</>
          }
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Side tabs */}
        <div style={{
          width: 180, borderRight: '1px solid #141414',
          padding: '16px 10px', flexShrink: 0,
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                background: tab === t.id ? '#141414' : 'transparent',
                color: tab === t.id ? 'var(--text)' : 'var(--text-3)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: tab === t.id ? 500 : 400,
                textAlign: 'left', transition: 'all 0.1s',
              }}
            >
              <span style={{ color: tab === t.id ? 'var(--green)' : 'currentColor' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 28 }} className="scrollbar-hide">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8 }} />
              ))}
            </div>
          ) : (
            <>
              {/* Store tab */}
              {tab === 'store' && (
                <div style={{ maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>Store Settings</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Manage your store's core details.</p>
                  </div>

                  <Field
                    label="Store name"
                    value={settings.name}
                    onChange={v => setSettings(s => ({ ...s, name: v }))}
                    placeholder="My Store"
                  />
                  <Field
                    label="Store URL"
                    value={settings.storeUrl || `${settings.slug}.seltra.store`}
                    readOnly
                    hint="Your store's public address. Contact support to change your slug."
                  />
                  <Field
                    label="Business type"
                    value={settings.businessType}
                    onChange={v => setSettings(s => ({ ...s, businessType: v }))}
                    placeholder="e.g. Fashion & Apparel"
                  />
                  <Field
                    label="Target audience"
                    value={settings.targetAudience}
                    onChange={v => setSettings(s => ({ ...s, targetAudience: v }))}
                    placeholder="e.g. Young women in Accra"
                  />
                </div>
              )}

              {/* Payments tab */}
              {tab === 'payments' && (
                <div style={{ maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>Payment Settings</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Connect your Paystack account to receive payments.</p>
                  </div>

                  <div style={{
                    background: 'var(--green-dim)', border: '1px solid var(--green-border)',
                    borderRadius: 10, padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <CreditCard size={16} color="#000" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Paystack</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Ghana · Nigeria · Stripe-ready</div>
                    </div>
                    <Badge variant="green" style={{ marginLeft: 'auto' }}>Connected</Badge>
                  </div>

                  <Field
                    label="Paystack Public Key"
                    value={settings.paystackPublicKey}
                    onChange={v => setSettings(s => ({ ...s, paystackPublicKey: v }))}
                    placeholder="pk_live_..."
                    hint="Used on your storefront checkout. Safe to expose publicly."
                  />
                  <Field
                    label="Paystack Secret Key"
                    value={settings.paystackSecretKey}
                    onChange={v => setSettings(s => ({ ...s, paystackSecretKey: v }))}
                    placeholder="sk_live_..."
                    type="password"
                    hint="Never share this key. Used server-side for payment verification."
                  />

                  <div style={{
                    background: '#111', border: '1px solid #1a1a1a', borderRadius: 10, padding: '14px 16px',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Test mode active</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                      You&apos;re using test keys. Switch to live keys when ready to accept real payments.
                      <br />Test card: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--green)' }}>4084 0840 8408 4081</span>, any future date, any CVV.
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications tab */}
              {tab === 'notifications' && (
                <div style={{ maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>Notifications</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Choose how you get notified about orders and activity.</p>
                  </div>

                  {[
                    { label: 'New order received', desc: 'Get notified when a customer places an order', defaultOn: true },
                    { label: 'Payment confirmed', desc: 'Paystack webhook confirms a successful payment', defaultOn: true },
                    { label: 'Low stock alert', desc: 'When a product has fewer than 5 units remaining', defaultOn: false },
                    { label: 'Weekly summary', desc: 'A summary of your store\'s performance every Monday', defaultOn: false },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                      gap: 16, padding: '14px 0', borderBottom: '1px solid #141414',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{item.desc}</div>
                      </div>
                      <Toggle defaultOn={item.defaultOn} />
                    </div>
                  ))}
                </div>
              )}

              {/* Domain tab */}
              {tab === 'domain' && (
                <div style={{ maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>Custom Domain</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Connect your own domain to your Seltra store.</p>
                  </div>

                  <div style={{
                    background: '#111', border: '1px solid #1a1a1a', borderRadius: 10, padding: '14px 16px',
                  }}>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Current store URL</div>
                    <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", color: 'var(--green)' }}>
                      {settings.slug}.seltra.store
                    </div>
                  </div>

                  <Field
                    label="Custom domain"
                    value={settings.customDomain}
                    onChange={v => setSettings(s => ({ ...s, customDomain: v }))}
                    placeholder="yourdomain.com"
                    hint="Enter your domain without https://. You'll need to update your DNS after saving."
                  />

                  {settings.customDomain && (
                    <div style={{
                      background: '#080808', border: '1px solid #1a1a1a',
                      borderRadius: 10, padding: '16px', fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Add this DNS record at your domain registrar:</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            {['Type', 'Name', 'Value'].map(h => (
                              <th key={h} style={{ fontSize: 11, color: '#555', textAlign: 'left', paddingBottom: 8, fontWeight: 500 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ fontSize: 12, color: 'var(--green)', paddingRight: 16 }}>CNAME</td>
                            <td style={{ fontSize: 12, color: 'var(--text-2)', paddingRight: 16 }}>@</td>
                            <td style={{ fontSize: 12, color: 'var(--text-2)' }}>cname.vercel-dns.com</td>
                          </tr>
                        </tbody>
                      </table>
                      <div style={{ marginTop: 10, fontSize: 11, color: '#444' }}>
                        DNS changes can take up to 48 hours to propagate.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Toggle component ──────────────────────────────────────────────────────────
function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn)

  return (
    <button
      onClick={() => setOn(v => !v)}
      style={{
        width: 42, height: 24, borderRadius: 100,
        background: on ? 'var(--green)' : '#222',
        border: 'none', cursor: 'pointer',
        position: 'relative', flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: on ? 21 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: on ? '#000' : '#555',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}