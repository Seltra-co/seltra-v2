//apps/web/app/(dashboard)/dashboard/page.tsx
// This is the main dashboard — the 3-pane view: agent chat (left/center) + store preview (right)

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send, CheckCircle, Loader2, Circle, ExternalLink,
  Edit2, Share2, Plus, BarChart3, Globe, Package, Zap
} from 'lucide-react'
import { MetricCard, StatusDot, Badge, Spinner } from '@/components/ui'

// ── Types ─────────────────────────────────────────────────────────────────────
interface AgentMessage {
  role: 'user' | 'agent'
  content: string
  timestamp: string
  action?: string
}

interface AgentLogEntry {
  step: string
  status: 'pending' | 'running' | 'done' | 'error'
  detail: string
  timestamp: string
}

interface StoreMetrics {
  visits: number
  revenue: string
  orders: number
  conversionRate: string
}

// ── Agent panel ───────────────────────────────────────────────────────────────
function AgentPanel({
  storeId,
  storeName,
  storeSlug,
  agentLog,
  messages,
  onSend,
  isBuilding,
}: {
  storeId: string
  storeName: string
  storeSlug: string
  agentLog: AgentLogEntry[]
  messages: AgentMessage[]
  onSend: (msg: string) => Promise<void>
  isBuilding: boolean
}) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || sending) return
    setInput('')
    setSending(true)
    await onSend(msg)
    setSending(false)
  }

  const agentStatus = isBuilding ? 'BUILDING'
    : agentLog.some(l => l.status === 'error') ? 'ERROR'
    : 'READY'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      borderRight: '1px solid #141414',
    }}>
      {/* Header */}
      <div style={{
        padding: '0 20px', height: 52,
        borderBottom: '1px solid #141414',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>
            // agent
          </span>
        </div>
        <div style={{
          padding: '3px 10px', borderRadius: 100,
          background: agentStatus === 'READY' ? 'var(--green-dim)' : agentStatus === 'BUILDING' ? 'rgba(250,204,21,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${agentStatus === 'READY' ? 'var(--green-border)' : agentStatus === 'BUILDING' ? 'rgba(250,204,21,0.2)' : 'rgba(239,68,68,0.2)'}`,
          fontSize: 11, fontWeight: 600,
          color: agentStatus === 'READY' ? 'var(--green)' : agentStatus === 'BUILDING' ? '#facc15' : '#f87171',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {agentStatus}
        </div>
      </div>

      {/* Agent log (build steps) */}
      {agentLog.length > 0 && (
        <div style={{
          padding: '12px 20px', borderBottom: '1px solid #141414',
          flexShrink: 0,
        }}>
          {agentLog.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '3px 0',
            }}>
              <div style={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {entry.status === 'done'
                  ? <CheckCircle size={13} color="var(--green)" />
                  : entry.status === 'running'
                  ? <Loader2 size={13} color="var(--green)" style={{ animation: 'spin 0.8s linear infinite' }} />
                  : entry.status === 'error'
                  ? <Circle size={13} color="#f87171" />
                  : <Circle size={13} color="#333" />
                }
              </div>
              <span style={{
                fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                color: entry.status === 'done' ? 'var(--green)'
                  : entry.status === 'running' ? 'var(--text)'
                  : entry.status === 'error' ? '#f87171'
                  : '#444',
              }}>
                {entry.detail}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="scrollbar-hide">
        {messages.length === 0 && !isBuilding && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '60%', textAlign: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--green-dim)', border: '1px solid var(--green-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={20} color="var(--green)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>What store will you launch?</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6, maxWidth: 300 }}>
                Describe the business — your agent will scaffold products, branding, payments, and storefront.
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            {msg.role === 'user' ? (
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>YOU</span>
                <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 4, lineHeight: 1.6 }}>
                  {msg.content}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: "'JetBrains Mono', monospace" }}>AGENT</span>
                <div style={{
                  fontSize: 14, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.7,
                  // Render **bold** markdown
                }}
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text);font-weight:600">$1</strong>')
                      .replace(/\n/g, '<br/>')
                  }}
                />
                {msg.action && (
                  <div style={{
                    marginTop: 6, fontSize: 11, color: 'var(--text-3)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    ↳ {msg.action}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid #141414',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: '#111', border: '1px solid #1a1a1a',
          borderRadius: 10, padding: '8px 12px',
          transition: 'border-color 0.15s',
        }}
          onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(0,168,107,0.3)' }}
          onBlurCapture={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Message your agent..."
            disabled={sending || isBuilding}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
              resize: 'none', lineHeight: 1.5, caretColor: 'var(--green)',
              maxHeight: 120, overflow: 'auto',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || isBuilding}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: input.trim() && !sending ? 'var(--green)' : '#1a1a1a',
              border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >
            {sending
              ? <Spinner size={13} color="var(--green)" />
              : <Send size={13} color={input.trim() ? '#000' : '#444'} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Store preview panel ───────────────────────────────────────────────────────
function StorePreviewPanel({
  store,
  metrics,
  loadingMetrics,
}: {
  store: { id: string; name: string; slug: string; status: string } | null
  metrics: StoreMetrics | null
  loadingMetrics: boolean
}) {
  const storefrontUrl = store?.slug
    ? `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/store/${store.slug}`
    : null

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
    }}>
      {/* Header */}
      <div style={{
        padding: '0 20px', height: 52,
        borderBottom: '1px solid #141414',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>
          // your store
        </span>
        {store && (
          <div style={{
            padding: '3px 10px', borderRadius: 100,
            background: 'var(--green-dim)', border: '1px solid var(--green-border)',
            fontSize: 11, fontWeight: 600, color: 'var(--green)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            LIVE
          </div>
        )}
      </div>

      {/* Storefront iframe */}
      <div style={{
        flex: 1, background: '#080808', position: 'relative',
        borderBottom: '1px solid #141414',
      }}>
        {store && storefrontUrl ? (
          <>
            {/* Browser chrome */}
            <div style={{
              padding: '8px 12px', background: '#0e0e0e',
              borderBottom: '1px solid #141414',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => (
                  <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div style={{
                flex: 1, background: '#141414', borderRadius: 4,
                padding: '3px 10px', fontSize: 11,
                color: '#555', fontFamily: "'JetBrains Mono', monospace",
                textAlign: 'center',
              }}>
                {store.slug}.seltra.store
              </div>
            </div>
            <iframe
              src={storefrontUrl}
              style={{
                width: '100%',
                height: 'calc(100% - 33px)',
                border: 'none',
                display: 'block',
              }}
              title={`${store.name} storefront preview`}
            />
          </>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '100%', textAlign: 'center', padding: 24,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: '#111', border: '1px solid #1a1a1a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Globe size={22} color="#333" />
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>What store will you launch?</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6, maxWidth: 260 }}>
              Describe the business — your agent will scaffold products, branding, payments, and storefront.
            </div>
          </div>
        )}
      </div>

      {/* Actions + metrics */}
      {store && (
        <div style={{ padding: '16px 20px', flexShrink: 0 }}>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {storefrontUrl && (
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#111', border: '1px solid #1a1a1a',
                  color: 'var(--text-2)', padding: '7px 12px',
                  borderRadius: 8, fontSize: 12, textDecoration: 'none',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.borderColor = '#2a2a2a'
                  e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.borderColor = '#1a1a1a'
                  e.currentTarget.style.color = 'var(--text-2)'
                }}
              >
                <ExternalLink size={13} /> View live store
              </a>
            )}
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#111', border: '1px solid #1a1a1a',
              color: 'var(--text-2)', padding: '7px 12px',
              borderRadius: 8, fontSize: 12, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'border-color 0.15s',
            }}>
              <Edit2 size={13} /> Edit store
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#111', border: '1px solid #1a1a1a',
              color: 'var(--text-2)', padding: '7px 12px',
              borderRadius: 8, fontSize: 12, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'border-color 0.15s',
            }}>
              <Share2 size={13} /> Share
            </button>
          </div>

          {/* Metrics strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'VISITS', value: loadingMetrics ? '—' : (metrics?.visits?.toLocaleString() ?? '0') },
              { label: 'REVENUE', value: loadingMetrics ? '—' : (metrics?.revenue ?? 'GHS 0') },
              { label: 'ORDERS', value: loadingMetrics ? '—' : (metrics?.orders?.toString() ?? '0') },
              { label: 'CONV. RATE', value: loadingMetrics ? '—' : (metrics?.conversionRate ?? '0%') },
            ].map(m => (
              <div key={m.label} style={{
                background: '#0e0e0e', border: '1px solid #1a1a1a',
                borderRadius: 8, padding: '10px 12px',
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                  {loadingMetrics
                    ? <div className="skeleton" style={{ width: 40, height: 18 }} />
                    : m.value
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, color: '#333', fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
              QUICK ACTIONS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: <Plus size={13} />, label: 'Add product' },
                { icon: <Edit2 size={13} />, label: 'Edit storefront' },
                { icon: <Globe size={13} />, label: 'Set up domain' },
                { icon: <BarChart3 size={13} />, label: 'View analytics' },
              ].map(a => (
                <button
                  key={a.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: '#0e0e0e', border: '1px solid #1a1a1a',
                    color: 'var(--text-3)', padding: '8px 12px',
                    borderRadius: 8, fontSize: 12, cursor: 'pointer',
                    fontFamily: 'inherit', textAlign: 'left',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--green-border)'
                    e.currentTarget.style.color = 'var(--green)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1a1a1a'
                    e.currentTarget.style.color = 'var(--text-3)'
                  }}
                >
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeStore, setActiveStore] = useState<{ id: string; name: string; slug: string; status: string } | null>(null)
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [agentLog, setAgentLog] = useState<AgentLogEntry[]>([])
  const [isBuilding, setIsBuilding] = useState(false)
  const [metrics, setMetrics] = useState<StoreMetrics | null>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Read active store from window (set by layout)
  useEffect(() => {
    const check = setInterval(() => {
      const store = (window as any).__seltra_active_store
      if (store) {
        setActiveStore(store)
        clearInterval(check)
      }
    }, 100)
    return () => clearInterval(check)
  }, [])

  // Load metrics when store is set
  useEffect(() => {
    if (!activeStore?.id) return
    loadMetrics()
    // Poll every 30s
    pollRef.current = setInterval(loadMetrics, 30000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [activeStore?.id])

  const getToken = () => {
    try {
      const s = localStorage.getItem('seltra_session')
      return s ? JSON.parse(s)?.token : null
    } catch { return null }
  }

  const loadMetrics = async () => {
    if (!activeStore?.id) return
    setLoadingMetrics(true)
    try {
      const token = getToken()
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/analytics/${activeStore.id}?period=30d`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch { /* silent — metrics are non-critical */ }
    finally { setLoadingMetrics(false) }
  }

  const handleSendMessage = useCallback(async (message: string) => {
    if (!activeStore?.id) return

    // Optimistically add user message
    const userMsg: AgentMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const token = getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          storeId: activeStore.id,
          message,
        }),
      })

      const data = await res.json()

      const agentMsg: AgentMessage = {
        role: 'agent',
        content: data.response_message || data.message || 'Done!',
        timestamp: new Date().toISOString(),
        action: data.action_log,
      }
      setMessages(prev => [...prev, agentMsg])

      // Refresh preview iframe by updating store state
      if (data.type !== 'question') {
        setActiveStore(s => s ? { ...s } : s)
      }
    } catch {
      const errMsg: AgentMessage = {
        role: 'agent',
        content: 'Something went wrong. Try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errMsg])
    }
  }, [activeStore?.id])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', height: '100vh' }}>
      {/* Left: Agent panel */}
      <AgentPanel
        storeId={activeStore?.id || ''}
        storeName={activeStore?.name || ''}
        storeSlug={activeStore?.slug || ''}
        agentLog={agentLog}
        messages={messages}
        onSend={handleSendMessage}
        isBuilding={isBuilding}
      />

      {/* Right: Store preview */}
      <StorePreviewPanel
        store={activeStore}
        metrics={metrics}
        loadingMetrics={loadingMetrics}
      />
    </div>
  )
}