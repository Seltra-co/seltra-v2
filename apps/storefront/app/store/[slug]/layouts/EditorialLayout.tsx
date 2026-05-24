//apps/storefront/app/store/[slug]/layouts/EditorialLayout.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Plus, Minus, ArrowRight, Search } from 'lucide-react'
import type { StoreData, CartItem } from '../types'
import { ProductImage } from '../components/ProductImage'
import { getVariantGroups } from '../utils'
import { CheckoutButton } from '../components/CheckoutButton'

export default function EditorialLayout({ store }: { store: StoreData }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState<StoreData['products'][0] | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  const categories = ['All', ...store.categories.map((c) => c.name)]
  const filteredProducts =
    activeCategory === 'All'
      ? store.products
      : store.products.filter((p) => p.category === activeCategory)

  const addToCart = (product: StoreData['products'][0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.product.id !== id))
  const updateQty = (id: string, delta: number) =>
    setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)
  const totalAmount = cart.reduce((s, i) => s + parseFloat(i.product.price) * i.quantity, 0)
  const currency = store.products[0]?.currency || 'GHS'

  // Editorial palette — warm, light, serif-led
  const C = {
    bg: '#faf9f7',
    surface: '#ffffff',
    accent: '#8B6914',
    accentLight: '#8B691415',
    text: '#1a1a1a',
    muted: '#6b6b6b',
    border: '#e8e4df',
  }

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        .editorial-product:hover { transform: translateY(-4px); }
        .editorial-product { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .editorial-product:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
      `}</style>

      {/* NAV */}
      <header style={{ borderBottom: `1px solid ${C.border}`, background: C.surface, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, color: C.text, letterSpacing: '-0.01em' }}>{store.name}</h1>
            <p style={{ fontSize: 11, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{store.businessType}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
              <Search size={18} />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.text, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: 'pointer', position: 'relative' }}
            >
              <ShoppingCart size={14} />
              Bag {totalItems > 0 && `(${totalItems})`}
            </button>
          </div>
        </div>

        {/* Category nav */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 14px', display: 'flex', gap: 24, overflowX: 'auto' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: activeCategory === cat ? C.accent : C.muted,
                fontWeight: activeCategory === cat ? 600 : 400,
                borderBottom: activeCategory === cat ? `1px solid ${C.accent}` : '1px solid transparent',
                paddingBottom: 4, whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* HERO — editorial full bleed */}
      <section style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '72px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, fontWeight: 600, marginBottom: 16 }}>
              New Collection
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(42px, 5vw, 64px)', lineHeight: 1.05, fontWeight: 400, color: C.text, marginBottom: 20 }}>
              {store.name}
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: C.muted, maxWidth: 400, marginBottom: 32 }}>
              For {store.targetAudience}
            </p>
            <button
              onClick={() => setActiveCategory('All')}
              style={{ background: C.text, color: '#fff', border: 'none', padding: '14px 32px', fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 }}
            >
              Shop Collection
            </button>
          </div>
          {/* Hero image — first product */}
          {store.products[0] && (
            <div style={{ aspectRatio: '4/5', overflow: 'hidden', background: '#f0ede8' }}>
              <ProductImage src={store.products[0].images?.[0]?.url} alt={store.products[0].name} index={0} />
            </div>
          )}
        </div>
      </section>

      {/* PRODUCTS — asymmetric 2-col */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 40 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 400, color: C.text }}>
            {activeCategory === 'All' ? 'All Products' : activeCategory}
          </h3>
          <span style={{ fontSize: 12, color: C.muted, letterSpacing: '0.06em' }}>{filteredProducts.length} pieces</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 32 }}>
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              className="editorial-product"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedProduct(product)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: '#f0ede8', marginBottom: 16 }}>
                <ProductImage src={product.images?.[0]?.url} alt={product.name} index={i} hover />
              </div>
              <div>
                <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.accent, marginBottom: 4 }}>{product.category}</p>
                <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, fontWeight: 400, color: C.text, marginBottom: 6 }}>{product.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, color: C.text, fontWeight: 500 }}>{currency} {parseFloat(product.price).toFixed(2)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                    style={{ background: 'none', border: `1px solid ${C.text}`, color: C.text, padding: '6px 16px', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = C.text; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = C.text }}
                  >
                    Add
                  </button>
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
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              style={{ background: C.surface, maxWidth: 640, width: '100%', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ aspectRatio: '1', background: '#f0ede8' }}>
                <ProductImage src={selectedProduct.images?.[0]?.url} alt={selectedProduct.name} index={store.products.findIndex(p => p.id === selectedProduct.id)} />
              </div>
              <div style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, marginBottom: 16, display: 'block', marginLeft: 'auto' }}><X size={18} /></button>
                  <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.accent, marginBottom: 8 }}>{selectedProduct.category}</p>
                  <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 12 }}>{selectedProduct.name}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: C.muted, marginBottom: 20 }}>{selectedProduct.description}</p>
                  {Object.entries(getVariantGroups(selectedProduct)).map(([name, values]) => (
                    <div key={name} style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>{name}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {values.map((val) => {
                          const key = `${selectedProduct.id}-${name}`
                          const sel = selectedVariants[key] === val
                          return (
                            <button key={val} onClick={() => setSelectedVariants(p => ({ ...p, [key]: val }))}
                              style={{ padding: '6px 14px', fontSize: 12, border: `1px solid ${sel ? C.text : C.border}`, background: sel ? C.text : 'none', color: sel ? '#fff' : C.text, cursor: 'pointer' }}>
                              {val}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 16 }}>{currency} {parseFloat(selectedProduct.price).toFixed(2)}</p>
                  <button
                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null) }}
                    style={{ width: '100%', background: C.text, color: '#fff', border: 'none', padding: '14px', fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Add to Bag
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
              style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
              onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 400, zIndex: 50, background: C.surface, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, fontWeight: 400 }}>Your Bag ({totalItems})</h2>
                <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                {cart.length === 0 ? (
                  <p style={{ color: C.muted, fontSize: 14, textAlign: 'center', marginTop: 40 }}>Your bag is empty</p>
                ) : cart.map((item) => (
                  <div key={item.product.id} style={{ display: 'flex', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ width: 72, height: 90, background: '#f0ede8', flexShrink: 0, overflow: 'hidden' }}>
                      <ProductImage src={item.product.images?.[0]?.url} alt={item.product.name} index={0} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{item.product.name}</p>
                      <p style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>{currency} {parseFloat(item.product.price).toFixed(2)}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={() => updateQty(item.product.id, -1)} style={{ background: 'none', border: `1px solid ${C.border}`, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={10} /></button>
                        <span style={{ fontSize: 13 }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, 1)} style={{ background: 'none', border: `1px solid ${C.border}`, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={10} /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, alignSelf: 'flex-start' }}><X size={14} /></button>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div style={{ padding: 24, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ fontSize: 13, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subtotal</span>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{currency} {totalAmount.toFixed(2)}</span>
                  </div>
                  <CheckoutButton cart={cart} store={store} currency={currency} totalAmount={totalAmount} accentColor={C.text} accentFg="#fff" />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}