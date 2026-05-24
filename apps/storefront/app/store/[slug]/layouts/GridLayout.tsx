//apps/storefront/app/store/[slug]/layouts/GridLayout.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Plus, Minus, ArrowRight, Search, Truck } from 'lucide-react'
import type { StoreData, CartItem } from '../types'
import { ProductImage } from '../components/ProductImage'
import { getVariantGroups } from '../utils'
import { CheckoutButton } from '../components/CheckoutButton'

export default function GridLayout({ store }: { store: StoreData }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState<StoreData['products'][0] | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  const categories = ['All', ...store.categories.map((c) => c.name)]
  const filteredProducts = activeCategory === 'All' ? store.products : store.products.filter((p) => p.category === activeCategory)

  const addToCart = (product: StoreData['products'][0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }
  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.product.id !== id))
  const updateQty = (id: string, delta: number) => setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)
  const totalAmount = cart.reduce((s, i) => s + parseFloat(i.product.price) * i.quantity, 0)
  const currency = store.products[0]?.currency || 'GHS'

  const C = { bg: '#0a0a0a', surface: '#111', accent: '#00A86B', accentFg: '#000', text: '#e5e7eb', muted: '#6b7280', border: '#1f1f1f' }

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        .grid-card { transition: border-color 0.2s ease; }
        .grid-card:hover { border-color: rgba(0,168,107,0.4) !important; }
      `}</style>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: `${C.bg}ee`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: C.text }}>{store.name}</h1>
            <p style={{ fontSize: 11, color: C.accent, fontFamily: 'monospace' }}>{store.businessType}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={14} color={C.muted} />
            </button>
            <button onClick={() => setCartOpen(true)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: '8px 16px', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
              <ShoppingCart size={14} /> Cart
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: C.accent, color: C.accentFg, borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalItems}</span>
              )}
            </button>
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ flexShrink: 0, padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: `1px solid ${activeCategory === cat ? C.accent : C.border}`, background: activeCategory === cat ? C.accent : C.surface, color: activeCategory === cat ? C.accentFg : C.muted, transition: 'all 0.2s' }}>
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(0,168,107,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,107,0.03) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px', position: 'relative' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>// {store.businessType}</span>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.05, marginTop: 8, marginBottom: 12 }}>{store.name}</h2>
          <p style={{ color: C.muted, marginBottom: 24, maxWidth: 480 }}>For {store.targetAudience}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {store.canonical.storeFeatures.slice(0, 4).map((f) => (
              <span key={f} style={{ fontSize: 11, padding: '6px 12px', borderRadius: 100, background: 'rgba(0,168,107,0.08)', border: '1px solid rgba(0,168,107,0.2)', color: C.accent, fontFamily: 'monospace' }}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, color: C.text }}>{filteredProducts.length} products{activeCategory !== 'All' && ` · ${activeCategory}`}</h3>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.muted }}>{store.canonical.recommendedTechStack.paymentGateways.join(' · ')}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {filteredProducts.map((product, i) => (
            <motion.div key={product.id} className="grid-card"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedProduct(product)}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer' }}
            >
              <div style={{ aspectRatio: '1', background: '#0d0d0d', position: 'relative', overflow: 'hidden' }}>
                <ProductImage src={product.images?.[0]?.url} alt={product.name} index={i} hover />
                <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, padding: '3px 8px', borderRadius: 100, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)', color: C.muted, fontFamily: 'monospace' }}>{product.category}</span>
              </div>
              <div style={{ padding: 16 }}>
                <h4 style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</h4>
                <p style={{ fontSize: 12, color: C.muted, marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{currency} {parseFloat(product.price).toFixed(2)}</span>
                  <button onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                    style={{ background: C.accent, color: C.accentFg, border: 'none', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#00c47a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = C.accent}
                  >Add</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* PRODUCT MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.85)' }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 520 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ aspectRatio: '16/9', background: '#0d0d0d', overflow: 'hidden' }}>
                <ProductImage src={selectedProduct.images?.[0]?.url} alt={selectedProduct.name} index={store.products.findIndex(p => p.id === selectedProduct.id)} />
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 20, color: C.text }}>{selectedProduct.name}</h3>
                    <span style={{ fontSize: 11, color: C.accent, fontFamily: 'monospace' }}>{selectedProduct.category}</span>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={20} /></button>
                </div>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>{selectedProduct.description}</p>
                {Object.entries(getVariantGroups(selectedProduct)).map(([name, values]) => (
                  <div key={name} style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace', letterSpacing: '0.06em', marginBottom: 8 }}>{name.toUpperCase()}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {values.map((val) => {
                        const key = `${selectedProduct.id}-${name}`
                        const sel = selectedVariants[key] === val
                        return (
                          <button key={val} onClick={() => setSelectedVariants(p => ({ ...p, [key]: val }))}
                            style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, border: `1px solid ${sel ? C.accent : C.border}`, background: sel ? C.accent : C.surface, color: sel ? C.accentFg : C.text, cursor: 'pointer', fontFamily: 'monospace' }}>
                            {val}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{currency} {parseFloat(selectedProduct.price).toFixed(2)}</span>
                  <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accent, color: C.accentFg, border: 'none', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#00c47a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = C.accent}
                  >
                    Add to Cart <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)', cursor: 'pointer' }}
              onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 380, zIndex: 50, background: '#0d0d0d', borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontWeight: 700, color: C.text }}>Cart</h2>
                  <p style={{ fontSize: 11, color: C.accent, fontFamily: 'monospace' }}>{totalItems} items</p>
                </div>
                <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {cart.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', textAlign: 'center' }}>
                    <ShoppingCart size={32} color={C.border} style={{ marginBottom: 12 }} />
                    <p style={{ color: C.muted, fontSize: 14 }}>Your cart is empty</p>
                  </div>
                ) : cart.map((item) => (
                  <div key={item.product.id} style={{ display: 'flex', gap: 12, padding: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 8 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: '#0d0d0d', flexShrink: 0 }}>
                      <ProductImage src={item.product.images?.[0]?.url} alt={item.product.name} index={0} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</p>
                      <p style={{ fontSize: 12, color: C.accent, fontFamily: 'monospace', marginBottom: 8 }}>{currency} {parseFloat(item.product.price).toFixed(2)}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => updateQty(item.product.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, background: C.border, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text }}><Minus size={10} /></button>
                        <span style={{ fontSize: 13, color: C.text, fontFamily: 'monospace', minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, background: C.border, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text }}><Plus size={10} /></button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{currency} {(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div style={{ padding: 16, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: C.muted, fontFamily: 'monospace' }}>Subtotal</span>
                    <span style={{ fontWeight: 700, color: C.text }}>{currency} {totalAmount.toFixed(2)}</span>
                  </div>
                  {store.canonical.additionalRecommendations?.logistics?.[0] && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: 'rgba(0,168,107,0.05)', border: '1px solid rgba(0,168,107,0.15)', borderRadius: 8, marginBottom: 12 }}>
                      <Truck size={12} color={C.accent} />
                      <span style={{ fontSize: 11, color: C.accent, fontFamily: 'monospace' }}>{store.canonical.additionalRecommendations.logistics[0]}</span>
                    </div>
                  )}
                  <CheckoutButton cart={cart} store={store} currency={currency} totalAmount={totalAmount} accentColor={C.accent} accentFg={C.accentFg} />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}