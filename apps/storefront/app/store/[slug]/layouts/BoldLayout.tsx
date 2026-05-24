//apps/storefront/app/store/[slug]/layouts/BoldLayout.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Plus, Minus, ArrowRight, Zap } from 'lucide-react'
import type { StoreData, CartItem } from '../types'
import { ProductImage } from '../components/ProductImage'
import { getVariantGroups } from '../utils'
import { CheckoutButton } from '../components/CheckoutButton'

export default function BoldLayout({ store }: { store: StoreData }) {
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

  const C = { bg: '#0d0d0d', surface: '#141414', accent: '#ff3c00', accentFg: '#ffffff', text: '#f0f0f0', muted: '#888888', border: '#222222' }

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
        .bold-card { transition: all 0.2s ease; }
        .bold-card:hover { transform: scale(1.02); }
        .bold-card:hover .bold-card-overlay { opacity: 1 !important; }
      `}</style>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: '#000', borderBottom: `2px solid ${C.accent}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.08em', color: C.text }}>{store.name}</h1>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: activeCategory === cat ? C.accent : C.muted, whiteSpace: 'nowrap' }}>
                  {cat}
                </button>
              ))}
            </div>
            <button onClick={() => setCartOpen(true)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, background: C.accent, color: C.accentFg, border: 'none', padding: '10px 18px', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
              <ShoppingCart size={14} /> BAG
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, background: C.text, color: C.bg, borderRadius: '50%', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalItems}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO — Full bleed, large type */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#000', minHeight: 400, display: 'flex', alignItems: 'center' }}>
        {store.products[0] && (
          <div style={{ position: 'absolute', inset: 0, opacity: 0.25 }}>
            <ProductImage src={store.products[0].images?.[0]?.url} alt={store.name} index={0} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.3))' }} />
        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Zap size={14} color={C.accent} />
            <span style={{ fontSize: 12, color: C.accent, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>New Drop</span>
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(64px, 12vw, 120px)', lineHeight: 0.9, letterSpacing: '0.02em', color: C.text, marginBottom: 24 }}>
            {store.name}
          </h2>
          <p style={{ fontSize: 14, color: C.muted, maxWidth: 400, lineHeight: 1.6, marginBottom: 32 }}>For {store.targetAudience}</p>
          <button onClick={() => setActiveCategory('All')}
            style={{ background: C.accent, color: C.accentFg, border: 'none', padding: '14px 36px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            SHOP NOW →
          </button>
        </div>
      </section>

      {/* PRODUCTS — staggered 2/3 col */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: '0.04em', color: C.text }}>
            {activeCategory === 'All' ? 'ALL PRODUCTS' : activeCategory.toUpperCase()}
          </h3>
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{filteredProducts.length} Items</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 4 }}>
          {filteredProducts.map((product, i) => (
            <motion.div key={product.id} className="bold-card"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedProduct(product)}
              style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', cursor: 'pointer', background: C.surface }}
            >
              <ProductImage src={product.images?.[0]?.url} alt={product.name} index={i} hover />
              {/* Overlay */}
              <div className="bold-card-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 40%, transparent 70%)', opacity: 0.7, transition: 'opacity 0.2s' }} />
              {/* Price badge */}
              <div style={{ position: 'absolute', top: 12, right: 12, background: C.accent, color: C.accentFg, padding: '4px 10px', fontSize: 12, fontWeight: 900 }}>
                {currency} {parseFloat(product.price).toFixed(0)}
              </div>
              {/* Product info */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
                <p style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{product.category}</p>
                <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '0.04em', color: C.text, marginBottom: 12 }}>{product.name}</h4>
                <button onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                  style={{ width: '100%', background: C.text, color: C.bg, border: 'none', padding: '10px', fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.accent}
                  onMouseLeave={(e) => e.currentTarget.style.background = C.text}
                >
                  ADD TO BAG
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* PRODUCT MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.92)' }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: C.surface, maxWidth: 680, width: '100%', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', border: `2px solid ${C.border}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ aspectRatio: '1', background: '#0a0a0a', overflow: 'hidden' }}>
                <ProductImage src={selectedProduct.images?.[0]?.url} alt={selectedProduct.name} index={store.products.findIndex(p => p.id === selectedProduct.id)} />
              </div>
              <div style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                    <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={20} /></button>
                  </div>
                  <p style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{selectedProduct.category}</p>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: '0.04em', lineHeight: 1, marginBottom: 12 }}>{selectedProduct.name}</h3>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>{selectedProduct.description}</p>
                  {Object.entries(getVariantGroups(selectedProduct)).map(([name, values]) => (
                    <div key={name} style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{name}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {values.map((val) => {
                          const key = `${selectedProduct.id}-${name}`
                          const sel = selectedVariants[key] === val
                          return (
                            <button key={val} onClick={() => setSelectedVariants(p => ({ ...p, [key]: val }))}
                              style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', border: `2px solid ${sel ? C.accent : C.border}`, background: sel ? C.accent : 'none', color: sel ? C.accentFg : C.text, cursor: 'pointer' }}>
                              {val}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: '0.04em', color: C.text, marginBottom: 16 }}>{currency} {parseFloat(selectedProduct.price).toFixed(2)}</p>
                  <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null) }}
                    style={{ width: '100%', background: C.accent, color: C.accentFg, border: 'none', padding: '16px', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    ADD TO BAG <ArrowRight size={16} />
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
              style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.8)', cursor: 'pointer' }}
              onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 380, zIndex: 50, background: '#0a0a0a', borderLeft: `2px solid ${C.accent}`, display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.06em' }}>YOUR BAG ({totalItems})</h2>
                <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {cart.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%' }}>
                    <p style={{ color: C.muted, fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Bag is empty</p>
                  </div>
                ) : cart.map((item) => (
                  <div key={item.product.id} style={{ display: 'flex', gap: 12, padding: 12, background: C.surface, marginBottom: 4 }}>
                    <div style={{ width: 64, height: 64, overflow: 'hidden', flexShrink: 0, background: C.bg }}>
                      <ProductImage src={item.product.images?.[0]?.url} alt={item.product.name} index={0} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.product.name}</p>
                      <p style={{ fontSize: 12, color: C.accent, fontWeight: 700, marginBottom: 8 }}>{currency} {parseFloat(item.product.price).toFixed(2)}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => updateQty(item.product.id, -1)} style={{ width: 24, height: 24, background: C.border, border: 'none', cursor: 'pointer', color: C.text, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={10} /></button>
                        <span style={{ fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, 1)} style={{ width: 24, height: 24, background: C.border, border: 'none', cursor: 'pointer', color: C.text, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={10} /></button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <p style={{ fontSize: 13, fontWeight: 900 }}>{currency} {(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div style={{ padding: 20, borderTop: `2px solid ${C.accent}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted }}>TOTAL</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: '0.04em' }}>{currency} {totalAmount.toFixed(2)}</span>
                  </div>
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