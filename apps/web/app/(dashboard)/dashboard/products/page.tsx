//apps/web/app/(dashboard)/dashboard/products/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, Search, Edit2, Trash2, X } from 'lucide-react'
import { Badge, Spinner } from '@/components/ui'

interface Product {
  id: string
  name: string
  description: string
  price: string
  currency: string
  category: string
  sku: string
  status: string
  images: Array<{ url: string; isPrimary: boolean }>
  variants: Array<{ name: string; value: string }>
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadProducts() }, [])

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('seltra_session') || '{}')?.token } catch { return null }
  }

  const getActiveStore = () => (window as any).__seltra_active_store || null

  const loadProducts = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const store = getActiveStore()
      const tenantId = store?.id

      if (!tenantId) { setProducts([]); setLoading(false); return }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/store/${store.slug}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      const data = await res.json()
      const storeData = data.data || data
      setProducts(storeData.products || [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const token = getToken()
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/products/${editing.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            name: editing.name,
            description: editing.description,
            price: parseFloat(editing.price),
          }),
        }
      )
      setProducts(prev => prev.map(p => p.id === editing.id ? editing : p))
      setEditing(null)
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '0 24px', height: 52, borderBottom: '1px solid #141414',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Package size={16} color="var(--green)" />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Products</span>
          {!loading && <Badge variant="ghost">{filtered.length}</Badge>}
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--green)', color: '#000', border: 'none',
          padding: '7px 14px', borderRadius: 8, fontSize: 12,
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
        }}>
          <Plus size={13} /> Add product
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #141414', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color="var(--text-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-base"
            style={{ paddingLeft: 34, height: 36, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="scrollbar-hide">
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 260, borderRadius: 12 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '60%', textAlign: 'center', gap: 12,
          }}>
            <Package size={32} color="#333" />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No products yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Build your first store to generate a product catalog</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filtered.map(product => (
              <div
                key={product.id}
                style={{
                  background: '#0e0e0e', border: '1px solid #1a1a1a',
                  borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
              >
                {/* Image */}
                <div style={{ aspectRatio: '1', background: '#080808', position: 'relative', overflow: 'hidden' }}>
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      referrerPolicy="no-referrer"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Package size={32} color="#222" />
                    </div>
                  )}

                  {/* Status badge */}
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    <Badge variant={product.status === 'active' ? 'green' : 'ghost'}>
                      {product.status}
                    </Badge>
                  </div>

                  {/* Actions overlay */}
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    display: 'flex', gap: 4, opacity: 0, transition: 'opacity 0.15s',
                  }}
                    className="product-actions"
                  >
                    <button
                      onClick={() => setEditing(product)}
                      style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: 'rgba(0,0,0,0.7)', border: '1px solid #333',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text)',
                      }}
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--green)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                    {product.category}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {product.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                      {product.currency} {parseFloat(product.price).toFixed(2)}
                    </span>
                    <button
                      onClick={() => setEditing(product)}
                      style={{
                        background: 'none', border: '1px solid #1a1a1a',
                        color: 'var(--text-3)', padding: '4px 8px',
                        borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'border-color 0.15s, color 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green-border)'; e.currentTarget.style.color = 'var(--green)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = 'var(--text-3)' }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit drawer */}
      {editing && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setEditing(null)}
        >
          <div
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0,
              width: 420, background: '#0e0e0e', borderLeft: '1px solid #1a1a1a',
              display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #141414', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Edit Product</div>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="scrollbar-hide">
              {editing.images?.[0]?.url && (
                <div style={{ aspectRatio: '16/9', background: '#080808', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
                  <img src={editing.images[0].url} alt={editing.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Product name</label>
                  <input
                    className="input-base"
                    value={editing.name}
                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Description</label>
                  <textarea
                    className="input-base"
                    value={editing.description}
                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                    rows={4}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Price ({editing.currency})</label>
                  <input
                    className="input-base"
                    type="number"
                    value={editing.price}
                    onChange={e => setEditing({ ...editing, price: e.target.value })}
                    step="0.01"
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Category</label>
                  <input
                    className="input-base"
                    value={editing.category}
                    onChange={e => setEditing({ ...editing, category: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #141414', display: 'flex', gap: 10 }}>
              <button onClick={() => setEditing(null)} className="btn-ghost" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={saving} style={{ flex: 1 }}>
                {saving ? <><Spinner size={13} /> Saving...</> : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}