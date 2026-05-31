//apps/web/app/(dashboard)/dashboard/analytics/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react'
import { MetricCard } from '@/components/ui'

interface Metrics {
  visits: number
  orders: number
  revenue: string | number
  conversionRate: string
}

type Period = '7d' | '30d' | 'all'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadMetrics() }, [period])

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('seltra_session') || '{}')?.token } catch { return null }
  }

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const store = (window as any).__seltra_active_store
      if (!store?.id) { setLoading(false); return }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/analytics/${store.id}?period=${period}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const formatRevenue = (v: string | number | undefined) => {
    if (!v) return 'GHS 0'
    const n = typeof v === 'string' ? parseFloat(v) : v
    return `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '0 24px', height: 52, borderBottom: '1px solid #141414',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={16} color="var(--green)" />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Analytics</span>
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', gap: 4, background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, padding: 3 }}>
          {(['7d', '30d', 'all'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 12,
                fontWeight: period === p ? 600 : 400,
                background: period === p ? '#1a1a1a' : 'transparent',
                color: period === p ? 'var(--text)' : 'var(--text-3)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {p === 'all' ? 'All time' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="scrollbar-hide">

        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 96, borderRadius: 12 }} />
            ))
          ) : (
            <>
              <MetricCard
                label="VISITS"
                value={metrics?.visits?.toLocaleString() ?? '0'}
                icon={<Users size={15} />}
              />
              <MetricCard
                label="ORDERS"
                value={metrics?.orders?.toString() ?? '0'}
                icon={<ShoppingBag size={15} />}
              />
              <MetricCard
                label="REVENUE"
                value={formatRevenue(metrics?.revenue)}
                icon={<DollarSign size={15} />}
              />
              <MetricCard
                label="CONV. RATE"
                value={metrics?.conversionRate ?? '0%'}
                icon={<TrendingUp size={15} />}
              />
            </>
          )}
        </div>

        {/* Placeholder chart area */}
        <div style={{
          background: '#0e0e0e', border: '1px solid #1a1a1a',
          borderRadius: 14, padding: 24, marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                // visits over time
              </div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Store Traffic</div>
            </div>
          </div>

          {/* Simple bar chart using CSS */}
          {loading ? (
            <div className="skeleton" style={{ height: 160, borderRadius: 8 }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, padding: '0 4px' }}>
              {/* Generate mock sparkline bars — in production this would be real daily data */}
              {[40, 65, 50, 80, 45, 90, 70, 55, 85, 60, 75, 95, 50, 65].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, borderRadius: '4px 4px 0 0',
                    background: `linear-gradient(to top, var(--green), rgba(0,168,107,0.3))`,
                    height: `${h}%`,
                    opacity: metrics?.visits ? 1 : 0.2,
                    transition: 'height 0.5s ease',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Empty state when no store */}
        {!loading && !metrics && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '60px 24px', textAlign: 'center', gap: 12,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: '#111',
              border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart3 size={22} color="#333" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>No data yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
                Analytics will appear once your store starts receiving visitors.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}