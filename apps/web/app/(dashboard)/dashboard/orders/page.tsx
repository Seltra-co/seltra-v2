//apps/web/app/(dashboard)/dashboard/orders/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Search, ChevronDown, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui'

interface Order {
  id: string
  customerName: string
  customerEmail: string
  totalAmount: string
  currency: string
  status: string
  paystackRef: string | null
  createdAt: string
  items: Array<{ productName: string; quantity: number; price: string }>
}

const STATUS_COLORS: Record<string, 'green' | 'yellow' | 'ghost' | 'red'> = {
  paid: 'green',
  confirmed: 'green',
  pending: 'yellow',
  shipped: 'green',
  delivered: 'green',
  cancelled: 'red',
  refunded: 'ghost',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('seltra_session') || '{}')?.token } catch { return null }
  }

  const getActiveStore = () => {
    return (window as any).__seltra_active_store || null
  }

  const loadOrders = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const store = getActiveStore()
      const tenantId = store?.id

      const url = tenantId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/orders?tenantId=${tenantId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/orders`

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : data.orders || data.data || [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '0 24px', height: 52,
        borderBottom: '1px solid #141414',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShoppingBag size={16} color="var(--green)" />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Orders</span>
          {!loading && (
            <Badge variant="ghost">{filtered.length}</Badge>
          )}
        </div>
        <button
          onClick={loadOrders}
          style={{
            background: '#111', border: '1px solid #1a1a1a',
            color: 'var(--text-2)', padding: '6px 14px',
            borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{
        padding: '12px 24px', borderBottom: '1px solid #141414',
        display: 'flex', gap: 10, flexShrink: 0,
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} color="var(--text-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, order ID..."
            className="input-base"
            style={{ paddingLeft: 34, height: 36, fontSize: 13 }}
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            background: '#111', border: '1px solid #1a1a1a', color: 'var(--text-2)',
            padding: '0 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            fontFamily: 'inherit', height: 36,
          }}
        >
          {['all', 'pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-hide">
        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '60%', textAlign: 'center', gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: '#111',
              border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingBag size={20} color="#333" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>No orders yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Orders will appear here when customers check out</div>
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #141414' }}>
                {['Order', 'Customer', 'Amount', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 24px', textAlign: 'left',
                    fontSize: 11, color: 'var(--text-3)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 500, letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  style={{
                    borderBottom: '1px solid #0e0e0e', cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#0a0a0a' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td style={{ padding: '14px 24px', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-3)' }}>
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{order.customerName || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{order.customerEmail}</div>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                    {order.currency} {parseFloat(order.totalAmount).toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <Badge variant={STATUS_COLORS[order.status] || 'ghost'}>
                      {order.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 12, color: 'var(--text-3)' }}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <ChevronDown size={14} color="var(--text-3)" style={{ transform: 'rotate(-90deg)' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order detail drawer */}
      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0,
              width: 400, background: '#0e0e0e',
              borderLeft: '1px solid #1a1a1a',
              display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #141414', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Order #{selected.id.slice(-6).toUpperCase()}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{formatDate(selected.createdAt)}</div>
              </div>
              <Badge variant={STATUS_COLORS[selected.status] || 'ghost'}>{selected.status}</Badge>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }} className="scrollbar-hide">
              {/* Customer */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>CUSTOMER</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{selected.customerName}</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>{selected.customerEmail}</div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>ITEMS</div>
                {(Array.isArray(selected.items) ? selected.items : []).map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: '1px solid #141414',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.productName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                      {selected.currency} {(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: 16, fontFamily: "'JetBrains Mono', monospace", color: 'var(--green)' }}>
                  {selected.currency} {parseFloat(selected.totalAmount).toFixed(2)}
                </span>
              </div>

              {/* Paystack ref */}
              {selected.paystackRef && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: '#111', borderRadius: 8, border: '1px solid #1a1a1a' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Paystack Reference</div>
                  <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--green)' }}>
                    {selected.paystackRef}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}