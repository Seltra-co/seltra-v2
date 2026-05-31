//apps/web/app/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Zap, Package, CreditCard, Cog, Store, Globe,
  MessageSquare, Wand2, Rocket, Brain, Palette, ImageIcon,
  Check, Loader2, Terminal, CornerDownLeft, Twitter, Github,
  Menu, X, TrendingUp, ShoppingBag, Users, DollarSign,
} from 'lucide-react'
import { SeltraLogo, Spinner } from '@/components/ui'

// ── Typewriter prompts (Africa-first, from concept) ───────────────────────────
const PROMPTS = [
  'Launch a skincare brand for Gen Z women in Accra',
  'Build a streetwear store for Lagos creatives',
  'Create a handmade jewelry shop with Paystack',
  'Start a digital art marketplace for African artists',
  'Open a B2B coffee wholesale store in Nairobi',
]

// ── Agent pipeline steps (from concept AgentPipeline.tsx) ─────────────────────
const PIPELINE_STEPS = [
  { key: 'intent',    label: 'Intent Parser',      sub: 'parse user prompt',     Icon: Brain },
  { key: 'products',  label: 'Product Generator',  sub: 'build catalog',         Icon: Package },
  { key: 'brand',     label: 'Brand Engine',       sub: 'name · palette · logo', Icon: Palette },
  { key: 'images',    label: 'Image Generator',    sub: 'render product shots',  Icon: ImageIcon },
  { key: 'payments',  label: 'Payment Setup',      sub: 'wire Paystack',         Icon: CreditCard },
  { key: 'deploy',    label: 'Storefront Deploy',  sub: 'ship to edge',          Icon: Rocket },
  { key: 'live',      label: 'Live Store',         sub: 'yourstore.seltra.store',Icon: Globe },
]

// ── Build stream lines per step (from concept BuildStream.tsx) ────────────────
const STREAM_LINES: string[][] = [
  ['→ parsing intent...', '  category: skincare', '  audience: gen-z women, accra', '  tone: playful, bold, clean', '✓ intent locked'],
  ['→ generating product catalog...', '  + Glow Serum 30ml — GHS 120', '  + Hydrating Cleanser — GHS 85', '  + SPF 50 Daily Shield — GHS 140', '  + Lip Butter Trio — GHS 95', '✓ 12 SKUs created'],
  ['→ creating brand identity...', '  name: "Yaa Skin"', '  palette: #0a0a0a · #00A86B · #fef3c7', '  voice: confident, warm, vivid', '✓ brand kit ready'],
  ['→ generating product images...', '  rendering 12 hero shots @ 2048px', '  ████████████░░░░░  72%', '✓ assets uploaded to cdn'],
  ['→ wiring Paystack checkout...', '  + currency: GHS, NGN, USD', '  + webhook: /api/seltra/paystack', '✓ payments live'],
  ['→ deploying to yourstore.seltra.store...', '  build: ok (2.1s)', '  edge: replicated to 14 regions', '✓ deploy complete'],
  ['● store is live → yaaskin.seltra.store', '● agent handoff: marketing.seltra → running'],
]

// ── TerminalHero (keeps existing interactivity + concept styles) ──────────────
function TerminalHero() {
  const [promptIdx, setPromptIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [built, setBuilt] = useState(false)
  const [storeUrl, setStoreUrl] = useState('')
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = PROMPTS[promptIdx]

  useEffect(() => {
    if (inputFocused || customPrompt) return
    const speed = isDeleting ? 25 : 45
    intervalRef.current = setTimeout(() => {
      if (!isDeleting) {
        if (displayed.length < current.length) setDisplayed(current.slice(0, displayed.length + 1))
        else setTimeout(() => setIsDeleting(true), 2200)
      } else {
        if (displayed.length > 0) setDisplayed(current.slice(0, displayed.length - 1))
        else { setIsDeleting(false); setPromptIdx(i => (i + 1) % PROMPTS.length) }
      }
    }, speed)
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current) }
  }, [displayed, isDeleting, current, inputFocused, customPrompt])

  const handleBuild = async () => {
    const prompt = customPrompt || displayed
    if (!prompt || loading) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setBuilt(true)
    setStoreUrl('your-store.seltra.store')
    setLoading(false)
  }

  return (
    <div style={{
      background: 'var(--terminal-bg)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflow: 'hidden',
      width: '100%',
    }}>
      {/* Window chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.5)' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(234,179,8,0.5)' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(0,168,107,0.5)' }} />
        <div style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Terminal size={12} color="var(--text-3)" />
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>
            seltra ~ build
          </span>
        </div>
      </div>

      {/* Terminal body */}
      <div style={{ padding: '18px 18px 22px', fontFamily: "'JetBrains Mono', monospace" }}>
        {/* Input row */}
        <div style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.025)',
          borderRadius: 10,
          border: `1px solid ${inputFocused ? 'var(--green-border)' : 'var(--border)'}`,
          transition: 'border-color 0.2s',
          marginBottom: 12,
        }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--green)', fontSize: 13, fontWeight: 500, userSelect: 'none',
          }}>$</span>
          <input
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onKeyDown={e => { if (e.key === 'Enter') handleBuild() }}
            placeholder={!inputFocused ? (displayed || 'Describe your store...') : 'Describe your store...'}
            disabled={loading || built}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 13,
              padding: '12px 40px 12px 30px',
              fontFamily: "'JetBrains Mono', monospace",
              caretColor: 'var(--green)',
            }}
          />
          {!inputFocused && !customPrompt && (
            <span className="cursor-blink" style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--green)', fontSize: 13,
            }}>▋</span>
          )}
        </div>

        {/* Example chips */}
        {!built && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              'Skincare brand for Gen Z in Accra',
              'Print-on-demand streetwear shop',
              'B2B coffee wholesale in Lagos',
            ].map(ex => (
              <button
                key={ex}
                onClick={() => setCustomPrompt(ex)}
                style={{
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-3)', fontSize: 11, padding: '4px 10px',
                  borderRadius: 100, cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.borderColor = 'var(--green-border)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                → {ex}
              </button>
            ))}
          </div>
        )}

        {/* Output / build button */}
        {built ? (
          <div className="fade-in">
            <div style={{ marginBottom: 10 }}>
              {['✓ Blueprint generated', '✓ Product catalog created (12 products)', '✓ Storefront configured', '✓ Paystack wired'].map(line => (
                <div key={line} style={{ fontSize: 12, color: 'var(--green)', marginBottom: 3, fontFamily: "'JetBrains Mono', monospace" }}>{line}</div>
              ))}
            </div>
            <div style={{
              background: 'var(--green-dim)', border: '1px solid var(--green-border)',
              borderRadius: 8, padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 12, color: 'var(--green)', fontFamily: "'JetBrains Mono', monospace" }}>
                🚀 {storeUrl}
              </span>
              <Link href="/sign-up" style={{
                fontSize: 11, color: '#000', background: 'var(--green)',
                padding: '4px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 600,
              }}>
                Claim →
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>
              ⏎ to deploy · shift+⏎ for newline
            </span>
            <button
              onClick={handleBuild}
              disabled={loading || (!customPrompt && !displayed)}
              style={{
                background: 'var(--green)', color: '#000',
                border: 'none', borderRadius: 6,
                padding: '7px 14px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                opacity: (loading || (!customPrompt && !displayed)) ? 0.5 : 1,
                transition: 'opacity 0.2s',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {loading ? <><Spinner size={12} /> Building...</> : <>Build my store <CornerDownLeft size={12} /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Agent Pipeline (from concept AgentPipeline.tsx) ───────────────────────────
function AgentPipeline({ running, activeStep, onStepChange }: {
  running: boolean; activeStep: number; onStepChange: (i: number) => void
}) {
  useEffect(() => {
    if (!running || activeStep < 0 || activeStep >= PIPELINE_STEPS.length) return
    const t = setTimeout(() => onStepChange(activeStep + 1), 1400)
    return () => clearTimeout(t)
  }, [running, activeStep, onStepChange])

  const status = (i: number) => {
    if (!running) return 'idle'
    if (i < activeStep) return 'done'
    if (i === activeStep) return 'active'
    return 'idle'
  }

  return (
    <div style={{
      borderRadius: 14, border: '1px solid var(--border)',
      background: 'rgba(14,14,14,0.7)', backdropFilter: 'blur(10px)',
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-3)' }}>
          agent.graph <span style={{ color: 'var(--green)' }}>/</span> pipeline
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-3)' }}>
          {running ? `step ${Math.min(activeStep + 1, PIPELINE_STEPS.length)}/${PIPELINE_STEPS.length}` : 'idle'}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 780 }}>
          {PIPELINE_STEPS.map((s, i) => {
            const st = status(i)
            const Icon = s.Icon
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                  flex: 1, borderRadius: 8,
                  border: `1px solid ${st === 'done' ? 'rgba(0,168,107,0.5)' : st === 'active' ? 'var(--green)' : 'var(--border)'}`,
                  background: st === 'done' ? 'var(--green-dim)' : st === 'active' ? 'rgba(0,168,107,0.1)' : 'rgba(10,10,10,0.4)',
                  padding: '10px 10px',
                  transition: 'all 0.3s',
                  ...(st === 'active' ? { boxShadow: '0 0 0 1px rgba(0,168,107,0.4), 0 0 20px rgba(0,168,107,0.2)' } : {}),
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${st === 'idle' ? 'var(--border)' : 'rgba(0,168,107,0.5)'}`,
                      color: st === 'idle' ? 'var(--text-3)' : 'var(--green)',
                      ...(st === 'active' ? { animation: 'pulseGlow 2.2s ease-in-out infinite' } : {}),
                    }}>
                      {st === 'done' ? <Check size={12} /> : st === 'active' ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sub}</div>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <svg width="18" height="16" style={{ flexShrink: 0 }}>
                    <line x1="0" y1="8" x2="18" y2="8"
                      stroke={st === 'done' ? 'var(--green)' : 'var(--border)'}
                      strokeWidth="1.5"
                      strokeDasharray={st === 'active' ? '4 4' : undefined}
                      style={st === 'active' ? { animation: 'dashFlow 1.2s linear infinite' } : undefined}
                    />
                  </svg>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Build stream terminal (from concept BuildStream.tsx) ──────────────────────
function BuildStream({ running, activeStep }: { running: boolean; activeStep: number }) {
  const [lines, setLines] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!running) { setLines([]); return }
    const step = Math.min(activeStep, PIPELINE_STEPS.length - 1)
    if (step < 0) return
    const stepLines = STREAM_LINES[step] ?? []
    let i = 0
    setLines(prev => [...prev, `\n[${PIPELINE_STEPS[step].key}]`])
    const iv = setInterval(() => {
      if (i >= stepLines.length) { clearInterval(iv); return }
      setLines(prev => [...prev, stepLines[i]])
      i++
    }, 220)
    return () => clearInterval(iv)
  }, [activeStep, running])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [lines])

  return (
    <div style={{
      borderRadius: 12, border: '1px solid var(--border)',
      background: 'var(--terminal-bg)', overflow: 'hidden',
      minHeight: 280, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-3)' }}>build.stream</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: running ? 'var(--green)' : 'var(--text-3)',
            ...(running ? { animation: 'pulseGlow 2.2s ease-in-out infinite' } : {}),
          }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-3)' }}>
            {running ? 'streaming' : 'waiting'}
          </span>
        </div>
      </div>
      <div ref={scrollRef} style={{
        flex: 1, padding: '14px', fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12, lineHeight: 1.65, overflowY: 'auto',
        color: 'var(--terminal-text)',
      }}>
        {!running && (
          <div style={{ color: 'var(--text-3)' }}>
            $ awaiting prompt...
            <span className="blink" style={{ display: 'inline-block', width: 8, height: 14, background: 'var(--green)', verticalAlign: 'middle', marginLeft: 4 }} />
          </div>
        )}
        {lines.map((l, i) => (
          <div key={i} className="stream-in" style={{ color: (l.startsWith('✓') || l.startsWith('●')) ? 'var(--green)' : undefined }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Demo section combining pipeline + stream ──────────────────────────────────
function LiveDemoSection() {
  const [running, setRunning] = useState(false)
  const [activeStep, setActiveStep] = useState(-1)

  const startDemo = () => {
    if (running) return
    setRunning(true)
    setActiveStep(0)
  }

  return (
    <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--green)', marginBottom: 8 }}>
            // pipeline
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', fontFamily: "'DM Serif Display', serif", marginBottom: 6 }}>
            Watch the agent <span style={{ color: 'var(--green)' }}>build in real time.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-3)', maxWidth: 480, lineHeight: 1.6 }}>
            Seven specialized agents coordinate across products, brand, images, and payments — all from one prompt.
          </p>
        </div>

        <AgentPipeline running={running} activeStep={activeStep} onStepChange={setActiveStep} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <BuildStream running={running} activeStep={activeStep} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!running ? (
              <button
                onClick={startDemo}
                style={{
                  background: 'var(--green)', color: '#000',
                  border: 'none', borderRadius: 10,
                  padding: '14px 24px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <Zap size={14} /> Run pipeline demo
              </button>
            ) : (
              <div style={{
                background: 'var(--green-dim)', border: '1px solid var(--green-border)',
                borderRadius: 10, padding: '14px 18px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--green)',
              }}>
                {activeStep >= PIPELINE_STEPS.length
                  ? '● all agents complete — store is live'
                  : `● running: ${PIPELINE_STEPS[Math.min(activeStep, PIPELINE_STEPS.length - 1)]?.key}`
                }
              </div>
            )}

            {/* Step list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PIPELINE_STEPS.map((s, i) => {
                const done = running && i < activeStep
                const active = running && i === activeStep
                return (
                  <div key={s.key} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px',
                    background: active ? 'var(--green-dim)' : 'transparent',
                    border: `1px solid ${active ? 'var(--green-border)' : 'transparent'}`,
                    borderRadius: 8, transition: 'all 0.2s',
                    opacity: !running ? 0.4 : done || active ? 1 : 0.3,
                  }}>
                    <div style={{ color: done || active ? 'var(--green)' : 'var(--text-3)' }}>
                      {done ? <Check size={13} /> : active ? <Loader2 size={13} className="animate-spin" /> : <s.Icon size={13} />}
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: done || active ? 'var(--text)' : 'var(--text-3)' }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace", marginLeft: 'auto' }}>
                      {s.sub}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Showcase stores (concept Showcase.tsx — image placeholders) ───────────────
const LIVE_STORES = [
  {
    name: 'Lumen Skincare',
    category: 'Beauty · Accra',
    desc: 'Gen Z skincare brand. Built in 4 minutes.',
    img: '/images/store-lumen.jpg',
    accent: '#c084fc',
  },
  {
    name: 'Fashionbrand',
    category: 'Apparel · Drops',
    desc: 'Bold streetwear drops with a cinematic storefront.',
    img: '/images/store-fashionbrand.jpg',
    accent: '#f97316',
  },
  {
    name: 'Handmade Jewels',
    category: 'Jewelry · Editorial',
    desc: 'Handmade necklaces, earrings and rings. Editorial feel.',
    img: '/images/store-handmade.jpg',
    accent: '#00A86B',
  },
]

// ── Features ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: Zap, title: 'AI Store Generation', desc: 'Describe your business, get a full storefront with branded products, copy, and images. No templates. No drag-and-drop.' },
  { Icon: CreditCard, title: 'Payments, built in', desc: 'Paystack wired up on day one. Accept mobile money, cards, and bank transfers. Ghana and Nigeria-ready.' },
  { Icon: ImageIcon, title: 'Product Image AI', desc: 'Upload a photo or describe your product. Seltra generates studio-quality images automatically.' },
  { Icon: Cog, title: 'Agent-run operations', desc: 'Your store restocks, reprices, and updates itself. You focus on traffic. The agent handles the rest.' },
]

// ── How it works ──────────────────────────────────────────────────────────────
const HOW_STEPS = [
  { Icon: MessageSquare, title: 'Describe your business', body: "Type what you're selling, who you're selling to, and where. The agent handles the rest.", code: "$ seltra build 'skincare for gen-z in accra'" },
  { Icon: Wand2, title: 'Agent builds your stack', body: 'Products, images, storefront, domain, and payments scaffolded in under 15 minutes.', code: '✓ 7 steps · 12m 04s' },
  { Icon: Rocket, title: 'Ship and scale', body: 'Your store goes live on your subdomain. The agent keeps it running, updated, and converting.', code: 'agent.status = autopilot' },
]

// ── Waitlist counter (from concept Testimonials.tsx) ──────────────────────────
function WaitlistSection() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const target = 247
    let i = 0
    const iv = setInterval(() => {
      i += 7
      if (i >= target) { setCount(target); clearInterval(iv) }
      else setCount(i)
    }, 30)
    return () => clearInterval(iv)
  }, [])

  return (
    <section id="waitlist" style={{ padding: '80px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'rgba(14,14,14,0.4)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{
          borderRadius: 20, border: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div className="bg-radial-fade" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--green)', marginBottom: 16 }}>// waitlist</div>
            <div style={{
              fontSize: 80, fontWeight: 700, color: 'var(--green)',
              fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
              textShadow: '0 0 18px rgba(0,168,107,0.5)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {count}
            </div>
            <p style={{ marginTop: 12, fontSize: 16, color: 'var(--text-2)', lineHeight: 1.6 }}>
              stores on the waitlist — <span style={{ color: 'var(--text)', fontWeight: 600 }}>first 50 launch free.</span>
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 10, maxWidth: 400, margin: '28px auto 0' }}>
              <input
                type="email"
                placeholder="you@brand.com"
                style={{
                  flex: 1, background: '#080808', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '12px 14px',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                  color: 'var(--text)', outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--green-border)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
              <button style={{
                background: 'var(--green)', color: '#000', border: 'none',
                borderRadius: 8, padding: '0 20px', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap',
              }}>
                Join <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Dashboard preview (from concept DashboardPreview.tsx) ─────────────────────
function DashboardPreview() {
  return (
    <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)', background: 'linear-gradient(to bottom, transparent, rgba(14,14,14,0.4))' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ maxWidth: 520, marginBottom: 48 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--green)', marginBottom: 8 }}>// dashboard</div>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', fontFamily: "'DM Serif Display', serif", marginBottom: 8 }}>
            Your command center.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.65 }}>
            One dashboard to chat with your agent, watch orders flow in, and steer growth.
          </p>
        </div>

        <div style={{
          borderRadius: 18, border: '1px solid var(--border)',
          background: 'rgba(14,14,14,0.8)', backdropFilter: 'blur(10px)',
          overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
        }}>
          {/* Window chrome */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 16px', borderBottom: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.45)' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(234,179,8,0.45)' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(0,168,107,0.45)' }} />
            <span style={{ marginLeft: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-3)' }}>
              app.seltra.store / lumen-skincare
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', minHeight: 400 }}>
            {/* Sidebar */}
            <aside style={{
              display: 'flex', flexDirection: 'column', gap: 2,
              padding: 14, borderRight: '1px solid var(--border)',
              background: 'rgba(5,5,5,0.5)',
            }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>workspace</div>
              {['Overview', 'Agent chat', 'Products', 'Orders', 'Customers', 'Marketing', 'Settings'].map((item, i) => (
                <div key={item} style={{
                  fontSize: 13, padding: '7px 10px', borderRadius: 7,
                  background: i === 0 ? 'var(--green-dim)' : 'transparent',
                  color: i === 0 ? 'var(--green)' : 'var(--text-3)',
                  cursor: 'default',
                }}>
                  {item}
                </div>
              ))}
            </aside>

            {/* Main */}
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  { Icon: DollarSign, label: 'Revenue', value: '$12,480', trend: '+18%' },
                  { Icon: ShoppingBag, label: 'Orders', value: '342', trend: '+12%' },
                  { Icon: Users, label: 'Customers', value: '1,204', trend: '+24%' },
                  { Icon: TrendingUp, label: 'Conv. rate', value: '3.8%', trend: '+0.4%' },
                ].map(s => (
                  <div key={s.label} style={{
                    borderRadius: 10, border: '1px solid var(--border)',
                    background: 'rgba(10,10,10,0.6)', padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <s.Icon size={13} color="var(--text-3)" />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--green)' }}>{s.trend}</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 10 }}>
                {/* Agent chat */}
                <div style={{ borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(10,10,10,0.6)', padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <MessageSquare size={14} color="var(--green)" />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Agent</span>
                    <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--green)' }}>online</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { text: 'Hi 👋 — your "Vitamin C Glow Serum" is trending. Want me to add a 10% bundle promo this weekend?', align: 'left' },
                      { text: 'Yes, run it Fri–Sun and email returning customers.', align: 'right' },
                      { text: 'Done. Promo live · email scheduled to 412 customers · ad budget reallocated.', align: 'left' },
                    ].map((m, i) => (
                      <div key={i} style={{
                        borderRadius: 8, padding: '8px 12px', fontSize: 12, lineHeight: 1.5, color: 'var(--text-2)',
                        background: m.align === 'right' ? 'var(--green-dim)' : 'rgba(255,255,255,0.03)',
                        border: m.align === 'right' ? '1px solid var(--green-border)' : '1px solid var(--border)',
                        marginLeft: m.align === 'right' ? 24 : 0,
                        marginRight: m.align === 'left' ? 24 : 0,
                      }}>
                        {m.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent orders */}
                <div style={{ borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(10,10,10,0.6)', padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Package size={13} color="var(--text-3)" />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Recent orders</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { id: '#1042', v: '$48.00', s: 'shipped' },
                      { id: '#1041', v: '$112.00', s: 'packing' },
                      { id: '#1040', v: '$26.50', s: 'shipped' },
                      { id: '#1039', v: '$89.00', s: 'paid' },
                    ].map(o => (
                      <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                        <span style={{ color: 'var(--text-3)' }}>{o.id}</span>
                        <span style={{ color: 'var(--text)' }}>{o.v}</span>
                        <span style={{ color: 'var(--green)' }}>{o.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,10,10,0.80)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <SeltraLogo />
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[['#showcase', '/showcase'], ['#pipeline', '/pipeline'], ['#waitlist', '/waitlist'], ['/careers', '/careers']].map(([href, label]) => (
              <Link key={label} href={href} style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12, color: 'var(--text-3)', padding: '5px 10px',
                borderRadius: 7, textDecoration: 'none', transition: 'color 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--green)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)' }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/sign-in" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12, color: 'var(--text-3)',
            padding: '7px 14px', borderRadius: 8,
            textDecoration: 'none', border: '1px solid var(--border)',
            transition: 'color 0.15s, border-color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            log in
          </Link>
          <Link href="/sign-up" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12, color: '#000',
            padding: '7px 16px', borderRadius: 8,
            textDecoration: 'none', background: 'var(--green)',
            fontWeight: 700, transition: 'background 0.15s',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--green)' }}
          >
            Try Seltra →
          </Link>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', display: 'none' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <Nav />

      {/* ── Hero ── */}
      <section className="grid-bg" style={{ padding: '100px 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

            {/* Left */}
            <div className="fade-in">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'var(--green-dim)', border: '1px solid var(--green-border)',
                borderRadius: 100, padding: '4px 12px', marginBottom: 24,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulseGlow 2.2s ease-in-out infinite' }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--green)' }}>beta</span>
                <span style={{ width: 1, height: 12, background: 'var(--green-border)' }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--green)' }}>AI-native commerce</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(42px, 5vw, 62px)',
                fontWeight: 700, lineHeight: 1.06,
                letterSpacing: '-0.035em',
                color: 'var(--text)', marginBottom: 20,
                fontFamily: "'DM Serif Display', serif",
              }}>
                Describe your store.
                <br />
                <span style={{ color: 'var(--green)' }}>Seltra builds and runs it.</span>
              </h1>

              <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 36, maxWidth: 440 }}>
                Launch a full storefront today — our agents handle
                operations, marketing, payments, and fulfilment.
              </p>

              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/sign-up" style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--green)', color: '#000',
                  padding: '13px 24px', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, textDecoration: 'none',
                }}>
                  Start your store <ArrowRight size={14} />
                </Link>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'transparent', color: 'var(--text-2)',
                  padding: '13px 20px', borderRadius: 10,
                  fontSize: 14, fontWeight: 500, border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}>
                  Book a call
                </button>
              </div>

              {/* Stats (from concept stats bar) */}
              <div style={{ display: 'flex', gap: 28, marginTop: 40 }}>
                {[
                  { n: '10+', l: 'Merchants in pipeline' },
                  { n: '1,800', l: 'Visits / day' },
                  { n: '15 min', l: 'Avg time to live' },
                ].map(({ n, l }) => (
                  <div key={l}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', fontFamily: "'JetBrains Mono', monospace" }}>{n}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: terminal */}
            <div className="fade-in stagger-2">
              <TerminalHero />
            </div>
          </div>
        </div>
      </section>

      {/* ── Showcase ── */}
      <section id="showcase" style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ maxWidth: 520, marginBottom: 48 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--green)', marginBottom: 8 }}>// showcase</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8, fontFamily: "'DM Serif Display', serif" }}>
              Live stores built with Seltra.
            </h2>
            <p style={{ color: 'var(--text-3)', fontSize: 16, lineHeight: 1.6 }}>
              Real businesses. Real revenue. All launched from a single prompt.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {LIVE_STORES.map((store, i) => (
              <a
                key={store.name}
                href="#"
                className="fade-in"
                style={{
                  borderRadius: 16, border: '1px solid var(--border)',
                  background: 'var(--surface)', overflow: 'hidden',
                  textDecoration: 'none', display: 'block',
                  transition: 'border-color 0.2s',
                  animationDelay: `${i * 0.08}s`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,168,107,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                {/* Image area */}
                <div style={{
                  aspectRatio: '16/10', background: '#080808',
                  overflow: 'hidden', position: 'relative',
                }}>
                  <img
                    src={store.img}
                    alt={`${store.name} storefront`}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', transition: 'transform 0.5s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                  {/* Fallback placeholder */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${store.accent}11`,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 11,
                      background: `${store.accent}22`, border: `1px solid ${store.accent}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Store size={20} color={store.accent} />
                    </div>
                  </div>
                  {/* Live badge */}
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(6px)',
                    borderRadius: 100, padding: '3px 10px',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text)',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', animation: 'pulseGlow 2.2s infinite' }} />
                    live
                  </div>
                  {/* Gradient overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,14,14,0.75), transparent)' }} />
                </div>

                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3, color: 'var(--text)' }}>{store.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>{store.category}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{store.desc}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Stats bar (from concept) */}
          <div style={{
            marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(14,14,14,0.5)',
            overflow: 'hidden',
          }}>
            {[
              { v: '10+', l: 'Merchants in pipeline' },
              { v: '1,800', l: 'Visits across stores / day' },
              { v: 'GHS 42k', l: 'Daily merchant payments' },
              { v: '15 min', l: 'Avg. time to live' },
            ].map((s, i, arr) => (
              <div key={s.l} style={{
                padding: '24px 20px', textAlign: 'center',
                borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--green)', fontFamily: "'JetBrains Mono', monospace', letterSpacing: '-0.02em" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--green)', marginBottom: 8 }}>// stack</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: "'DM Serif Display', serif" }}>
              Not a builder.{' '}
              <span style={{ color: 'var(--green)' }}>Specialized agents that run your store.</span>
            </h2>
          </div>

          {/* 2×2 grid with gap-px concept pattern */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1, background: 'var(--border)', borderRadius: 14, overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            {FEATURES.map(f => (
              <div
                key={f.title}
                style={{
                  background: 'var(--dark)', padding: '28px 28px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--dark)' }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--green)', marginBottom: 18,
                  transition: 'border-color 0.2s',
                }}>
                  <f.Icon size={18} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ maxWidth: 460, marginBottom: 48 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--green)', marginBottom: 8 }}>// how it works</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: "'DM Serif Display', serif" }}>
              One prompt. <span style={{ color: 'var(--green)' }}>Live store.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {HOW_STEPS.map((s, i) => (
              <div key={s.title} style={{
                borderRadius: 14, border: '1px solid var(--border)',
                background: 'var(--surface)', padding: '28px 24px',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Step badge (from concept) */}
                <div style={{
                  position: 'absolute', top: -1, left: 20,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                  padding: '3px 8px', borderRadius: '0 0 6px 6px',
                  background: 'var(--green)', color: '#000', fontWeight: 700,
                }}>
                  step_{String(i + 1).padStart(2, '0')}
                </div>

                {/* Large watermark number */}
                <div style={{
                  position: 'absolute', top: 12, right: 16,
                  fontSize: 52, fontWeight: 800, color: 'var(--border)',
                  fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
                  pointerEvents: 'none',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div style={{
                  width: 40, height: 40, borderRadius: 10, marginTop: 20, marginBottom: 18,
                  background: 'var(--green-dim)', border: '1px solid var(--green-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--green)',
                }}>
                  <s.Icon size={18} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 16 }}>{s.body}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  color: 'var(--green)', background: 'var(--terminal-bg)',
                  border: '1px solid var(--border)', borderRadius: 6,
                  padding: '8px 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {s.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agent pipeline demo ── */}
      <LiveDemoSection />

      {/* ── Dashboard preview ── */}
      <DashboardPreview />

      {/* ── Waitlist ── */}
      <WaitlistSection />

      {/* ── Final CTA ── */}
      <section style={{ padding: '80px 24px 100px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div className="bg-radial-fade" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700, letterSpacing: '-0.035em',
              lineHeight: 1.08, marginBottom: 16,
              fontFamily: "'DM Serif Display', serif",
            }}>
              Your store is{' '}
              <span style={{ color: 'var(--green)' }}>one prompt away.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-3)', marginBottom: 36, lineHeight: 1.65 }}>
              No code. No designers. No dashboards. Just describe what you&apos;re building.
            </p>
            <Link href="/sign-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--green)', color: '#000',
              padding: '14px 32px', borderRadius: 10,
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
            }}>
              Start building →
            </Link>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-3)', marginTop: 16 }}>
              Free to start · No credit card required · Live in minutes
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer (from concept Footer.tsx with social icons) ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px', background: 'var(--darker)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 32,
          }}>
            <div>
              <SeltraLogo size="sm" />
              <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-3)', maxWidth: 240, lineHeight: 1.6 }}>
                Commerce that runs itself.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
              {[['#', 'careers'], ['#', 'terms'], ['#', 'privacy']].map(([href, label]) => (
                <Link key={label} href={href} style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12, color: 'var(--text-3)', textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--green)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)' }}
                >
                  {label}
                </Link>
              ))}
              <a href="https://x.com/seltra" target="_blank" rel="noreferrer" style={{ color: 'var(--text-3)', transition: 'color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-3)' }}
                aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-3)', transition: 'color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-3)' }}
                aria-label="GitHub">
                <Github size={16} />
              </a>
            </div>
          </div>

          <div style={{
            paddingTop: 20, borderTop: '1px solid var(--border)',
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-3)',
          }}>
            <span>© 2026 Seltra Inc. All rights reserved.</span>
            <span>seltra.co · v0.1.0 · all systems <span style={{ color: 'var(--green)' }}>●</span> operational</span>
          </div>
        </div>
      </footer>
    </div>
  )
}