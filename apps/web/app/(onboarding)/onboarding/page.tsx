//apps/web/app/(onboarding)/onboarding/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield, FileText, Eye, EyeOff, Sparkles, Package, Truck,
  ArrowRight, ChevronLeft, Check, Store, Zap
} from 'lucide-react'
import { SeltraLogo, Spinner } from '@/components/ui'
import { markOnboardingComplete } from '@/lib/cookies'

// ── Step types ────────────────────────────────────────────────────────────────
type Step = 'welcome' | 'tos' | 'analytics' | 'category' | 'product_status' | 'revenue' | 'prompt'

interface OnboardingData {
  analytics_consent: boolean
  business_category: string
  product_status: string
  revenue_bracket: string
  prompt: string
}

// ── Progress bar ──────────────────────────────────────────────────────────────
const STEPS: Step[] = ['welcome', 'tos', 'analytics', 'category', 'product_status', 'revenue', 'prompt']

function ProgressBar({ step }: { step: Step }) {
  const idx = STEPS.indexOf(step)
  const pct = ((idx) / (STEPS.length - 1)) * 100

  return (
    <div style={{
      width: '100%', height: 3,
      background: '#1a1a1a', borderRadius: 2, marginBottom: 36,
    }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: 'var(--green)', borderRadius: 2,
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

// ── Step: Welcome ─────────────────────────────────────────────────────────────
function WelcomeStep({ name, onNext }: { name: string; onNext: () => void }) {
  const firstName = name?.split(' ')[0] || 'there'

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>
        Welcome to Seltra, {firstName}.
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 32 }}>
        Your AI commerce agent. Before we build your first store, let&apos;s get to know your business.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {[
          { icon: <Sparkles size={18} />, title: 'Tell us about your business', sub: '60 seconds' },
          { icon: <Store size={18} />, title: 'Your agent builds your store', sub: 'Live in minutes' },
          { icon: <Truck size={18} />, title: 'We run ops, ads & fulfilment', sub: 'On autopilot' },
        ].map(item => (
          <div key={item.title} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: '#111', border: '1px solid #1a1a1a',
            borderRadius: 12, padding: '14px 16px',
            cursor: 'default',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--green-dim)', border: '1px solid var(--green-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--green)', flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{item.sub}</div>
            </div>
            <ArrowRight size={14} color="var(--text-3)" />
          </div>
        ))}
      </div>

      <button onClick={onNext} className="btn-primary">
        Get started
      </button>
    </div>
  )
}

// ── Step: ToS ─────────────────────────────────────────────────────────────────
function TosStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Welcome to Seltra
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 28, lineHeight: 1.6 }}>
        Before we get started, please review our privacy practices and terms of service.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {[
          { icon: <Shield size={18} />, label: 'Privacy Practices' },
          { icon: <FileText size={18} />, label: 'Terms of Service' },
        ].map(item => (
          <button
            key={item.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: '#111', border: '1px solid #1a1a1a',
              borderRadius: 12, padding: '14px 16px',
              color: 'var(--text)', cursor: 'pointer',
              textAlign: 'left', fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green-border)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--green-dim)', border: '1px solid var(--green-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--green)', flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{item.label}</span>
            <ArrowRight size={14} color="var(--text-3)" />
          </button>
        ))}
      </div>

      <button onClick={onNext} className="btn-primary">
        I Accept
      </button>
    </div>
  )
}

// ── Step: Analytics consent ───────────────────────────────────────────────────
function AnalyticsStep({ onNext }: { onNext: (consent: boolean) => void }) {
  const [selected, setSelected] = useState<boolean | null>(null)

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Help us improve Seltra?
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 28 }}>
        You can change this anytime in settings.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {[
          {
            value: true,
            icon: <Eye size={18} />,
            title: 'Share Conversations',
            desc: 'Help us improve Seltra by sharing anonymized conversations — we only see what was said, never who said it.',
          },
          {
            value: false,
            icon: <EyeOff size={18} />,
            title: 'Keep Private',
            desc: 'Your conversations stay private — out of our analytics and never used to improve Seltra.',
          },
        ].map(opt => (
          <button
            key={opt.title}
            onClick={() => setSelected(opt.value)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              background: selected === opt.value ? 'var(--green-dim)' : '#111',
              border: `1px solid ${selected === opt.value ? 'var(--green-border)' : '#1a1a1a'}`,
              borderRadius: 12, padding: '14px 16px',
              color: 'var(--text)', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: selected === opt.value ? 'var(--green-dim)' : '#1a1a1a',
              border: `1px solid ${selected === opt.value ? 'var(--green-border)' : '#222'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--green)', flexShrink: 0,
            }}>
              {opt.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{opt.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{opt.desc}</div>
            </div>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
              border: `2px solid ${selected === opt.value ? 'var(--green)' : '#333'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selected === opt.value && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => selected !== null && onNext(selected)}
        className="btn-primary"
        disabled={selected === null}
      >
        Continue
      </button>
    </div>
  )
}

// ── Step: Business category ───────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'beauty', label: 'Beauty & Skincare' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home', label: 'Home & Lifestyle' },
  { value: 'digital', label: 'Digital Products' },
  { value: 'other', label: 'Other' },
]

function CategoryStep({ onNext }: { onNext: (cat: string) => void }) {
  const [selected, setSelected] = useState('')

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
        What&apos;s the nature of your business?
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 28 }}>
        Helps your agent pick the right playbook.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelected(cat.value)}
            style={{
              background: selected === cat.value ? 'var(--green-dim)' : '#111',
              border: `1px solid ${selected === cat.value ? 'var(--green-border)' : '#1a1a1a'}`,
              borderRadius: 10, padding: '12px 16px',
              color: selected === cat.value ? 'var(--green)' : 'var(--text-2)',
              cursor: 'pointer', fontSize: 13, fontWeight: selected === cat.value ? 600 : 400,
              textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onNext(selected)}
        className="btn-primary"
        disabled={!selected}
      >
        Continue
      </button>
    </div>
  )
}

// ── Step: Product status ──────────────────────────────────────────────────────
const PRODUCT_OPTIONS = [
  { value: 'has_product', icon: <Package size={18} />, title: 'Yes, I have a product', sub: 'Ready to launch' },
  { value: 'exploring', icon: <Zap size={18} />, title: 'No, still exploring', sub: 'Looking for the right product' },
  { value: 'dropship', icon: <Truck size={18} />, title: 'I want to dropship', sub: 'Source winners and sell' },
]

function ProductStatusStep({ onNext }: { onNext: (status: string) => void }) {
  const [selected, setSelected] = useState('')

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Do you already have a product to sell?
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 28 }}>
        We&apos;ll tailor your agent&apos;s workflow.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {PRODUCT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: selected === opt.value ? 'var(--green-dim)' : '#111',
              border: `1px solid ${selected === opt.value ? 'var(--green-border)' : '#1a1a1a'}`,
              borderRadius: 12, padding: '14px 16px',
              color: 'var(--text)', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: selected === opt.value ? 'var(--green-dim)' : '#1a1a1a',
              border: `1px solid ${selected === opt.value ? 'var(--green-border)' : '#222'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--green)', flexShrink: 0,
            }}>
              {opt.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{opt.sub}</div>
            </div>
            <ArrowRight size={14} color={selected === opt.value ? 'var(--green)' : 'var(--text-3)'} />
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onNext(selected)}
        className="btn-primary"
        disabled={!selected}
      >
        Continue
      </button>
    </div>
  )
}

// ── Step: Revenue ─────────────────────────────────────────────────────────────
const REVENUE_OPTIONS = [
  { value: 'none', label: 'None', sub: 'Just starting out' },
  { value: 'under_5k', label: 'Under $5K', sub: 'Per month' },
  { value: '5k_50k', label: '$5K – $50K', sub: 'Per month' },
  { value: '50k_plus', label: '$50K+', sub: 'Per month' },
]

function RevenueStep({ onNext }: { onNext: (rev: string) => void }) {
  const [selected, setSelected] = useState('')

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
        What is your store&apos;s monthly revenue?
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 28 }}>
        Helps us get to know your business.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
        {REVENUE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            style={{
              background: selected === opt.value ? 'var(--green-dim)' : '#111',
              border: `1px solid ${selected === opt.value ? 'var(--green-border)' : '#1a1a1a'}`,
              borderRadius: 12, padding: '16px 16px',
              color: 'var(--text)', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            <div style={{
              fontSize: 11, color: 'var(--green)',
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 6,
            }}>$</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{opt.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{opt.sub}</div>
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onNext(selected)}
        className="btn-primary"
        disabled={!selected}
      >
        Continue
      </button>
    </div>
  )
}

// ── Step: Prompt (terminal) ───────────────────────────────────────────────────
function PromptStep({
  name,
  onSubmit,
}: {
  name: string
  onSubmit: (prompt: string) => Promise<void>
}) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const firstName = name?.split(' ')[0] || 'there'

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    await onSubmit(prompt.trim())
  }

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
        What are you building, {firstName}?
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.6 }}>
        Tell your agent about your store. The more detail, the better.
      </p>

      {/* Terminal input */}
      <div style={{
        background: '#080808',
        border: '1px solid #1a1a1a',
        borderRadius: 12, marginBottom: 16, overflow: 'hidden',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {/* Header bar */}
        <div style={{
          padding: '8px 14px', borderBottom: '1px solid #111',
          fontSize: 11, color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>seltra ~ new store</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#333', display: 'inline-block' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#333', display: 'inline-block' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#333', display: 'inline-block' }} />
          </div>
        </div>

        {/* Text area */}
        <div style={{ padding: '14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--green)', fontSize: 13, marginTop: 1, flexShrink: 0 }}>$</span>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={`e.g. handmade shea butter skincare for young women in Accra & Lagos...`}
            disabled={loading}
            rows={4}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#e5e7eb', fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
              resize: 'none', lineHeight: 1.6, caretColor: 'var(--green)',
            }}
          />
        </div>

        <div style={{
          padding: '0 14px 12px',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <span style={{ fontSize: 11, color: '#333' }}>
            ↵ to deploy · shift+↵ for newline
          </span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="btn-primary"
        disabled={!prompt.trim() || loading}
      >
        {loading
          ? <><Spinner size={14} /> Building your store...</>
          : <>Build my store →</>
        }
      </button>
    </div>
  )
}

// ── Building overlay ──────────────────────────────────────────────────────────
const BUILD_STEPS = [
  'Analyzing business prompt...',
  'Generating store blueprint...',
  'Creating product catalog (8 products)...',
  'Generating product images...',
  'Designing storefront layout...',
  'Setting up Paystack integration...',
  'Configuring storefront...',
]

function BuildingOverlay({ storeSlug }: { storeSlug: string }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const delays = [700, 1000, 1400, 1200, 900, 800, 600]
    let idx = 0

    const advance = () => {
      if (idx < BUILD_STEPS.length - 1) {
        idx++
        setCurrentStep(idx)
        setTimeout(advance, delays[idx] || 800)
      } else {
        setTimeout(() => {
          setDone(true)
          setTimeout(() => router.push('/dashboard'), 1200)
        }, 600)
      }
    }

    setTimeout(advance, delays[0])
  }, [router])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'var(--darker)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(0,168,107,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div className="node-active" style={{
            width: 56, height: 56, borderRadius: 14,
            background: done ? 'var(--green)' : 'var(--green-dim)',
            border: '1px solid var(--green-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            {done
              ? <Check size={24} color="#000" />
              : <Spinner size={22} color="var(--green)" />
            }
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
            {done ? 'Your store is live! 🚀' : 'Building your store...'}
          </h2>
          {storeSlug && (
            <p style={{ fontSize: 13, color: 'var(--green)', fontFamily: "'JetBrains Mono', monospace" }}>
              {storeSlug}.seltra.store
            </p>
          )}
        </div>

        {/* Step log */}
        <div style={{
          background: '#080808', border: '1px solid #1a1a1a',
          borderRadius: 12, padding: '16px', fontFamily: "'JetBrains Mono', monospace",
        }}>
          {BUILD_STEPS.map((step, i) => {
            const isActive = i === currentStep && !done
            const isDone = i < currentStep || done

            return (
              <div key={step} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '5px 0',
                opacity: isDone || isActive ? 1 : 0.25,
                transition: 'opacity 0.3s',
              }}>
                <div style={{ width: 16, height: 16, flexShrink: 0 }}>
                  {isDone ? (
                    <Check size={14} color="var(--green)" />
                  ) : isActive ? (
                    <Spinner size={14} color="var(--green)" />
                  ) : (
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      border: '1px solid #333', margin: '2px',
                    }} />
                  )}
                </div>
                <span style={{
                  fontSize: 12,
                  color: isDone ? 'var(--green)' : isActive ? '#e5e7eb' : '#444',
                }}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main onboarding page ──────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [building, setBuilding] = useState(false)
  const [builtSlug, setBuiltSlug] = useState('')

  const [data, setData] = useState<Partial<OnboardingData>>({})

  // Get user name from session
  const [userName, setUserName] = useState('')
  useEffect(() => {
    try {
      const s = localStorage.getItem('seltra_session')
      if (s) {
        const parsed = JSON.parse(s)
        setUserName(parsed?.user?.name || '')
      }
    } catch { /* ignore */ }
  }, [])

  const getSession = () => {
    try {
      const s = localStorage.getItem('seltra_session')
      return s ? JSON.parse(s) : null
    } catch { return null }
  }

  const saveStep = async (stepData: Partial<OnboardingData>) => {
    const merged = { ...data, ...stepData }
    setData(merged)
    // Persist to localStorage (backend save happens at final step)
    localStorage.setItem('seltra_onboarding', JSON.stringify(merged))
  }

  const goNext = () => {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  const goBack = () => {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  const handleBuildStore = async (prompt: string) => {
    const onboardingData = { ...data, prompt }
    setData(onboardingData)

    const session = getSession()
    const token = session?.token

    // Save onboarding profile first
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...onboardingData, onboarding_completed: true }),
      })
    } catch { /* continue even if this fails */ }

    // Mark onboarding cookie so middleware allows dashboard access
    markOnboardingComplete()

    // Trigger store build
    setBuilding(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/agent/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt, merchantContext: onboardingData }),
      })
      const result = await res.json()

      if (result.success && result.blueprint?.storeSlug) {
        setBuiltSlug(result.blueprint.storeSlug)
        // Store the tenantId in session for dashboard use
        const sess = getSession()
        if (sess) {
          sess.activeTenantId = result.tenantId
          localStorage.setItem('seltra_session', JSON.stringify(sess))
        }
      }
    } catch {
      // Even if API fails, show the building screen and redirect
    }

    // Building overlay handles the redirect after animation
  }

  if (building) {
    return <BuildingOverlay storeSlug={builtSlug} />
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--darker)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Glow */}
      <div style={{
        position: 'fixed', top: '35%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(0,168,107,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <SeltraLogo />
        </div>

        {/* Card */}
        <div className="auth-card" style={{ padding: '36px 32px' }}>
          <ProgressBar step={step} />

          {/* Back button */}
          {step !== 'welcome' && (
            <button
              onClick={goBack}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', color: 'var(--text-3)',
                fontSize: 13, cursor: 'pointer', marginBottom: 20,
                padding: 0, fontFamily: 'inherit',
              }}
            >
              <ChevronLeft size={14} /> back
            </button>
          )}

          {step === 'welcome' && (
            <WelcomeStep name={userName} onNext={goNext} />
          )}
          {step === 'tos' && (
            <TosStep onNext={goNext} />
          )}
          {step === 'analytics' && (
            <AnalyticsStep onNext={(consent) => {
              saveStep({ analytics_consent: consent })
              goNext()
            }} />
          )}
          {step === 'category' && (
            <CategoryStep onNext={(cat) => {
              saveStep({ business_category: cat })
              goNext()
            }} />
          )}
          {step === 'product_status' && (
            <ProductStatusStep onNext={(status) => {
              saveStep({ product_status: status })
              goNext()
            }} />
          )}
          {step === 'revenue' && (
            <RevenueStep onNext={(rev) => {
              saveStep({ revenue_bracket: rev })
              goNext()
            }} />
          )}
          {step === 'prompt' && (
            <PromptStep name={userName} onSubmit={handleBuildStore} />
          )}
        </div>
      </div>
    </div>
  )
}