'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Plus, Minus, ArrowRight, Search, Truck } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: string
  currency: string
  category: string
  sku: string
  tags: string[]
  images: Array<{ url: string }>
  variants: Array<{ name: string; value: string }>
}

interface CartItem {
  product: Product
  quantity: number
}

interface StoreData {
  id: string
  name: string
  slug: string
  businessType: string
  targetAudience: string
  canonical: {
    storeFeatures: string[]
    productCategories: string[]
    recommendedTechStack: {
      paymentGateways: string[]
      shippingIntegration: string
    }
    additionalRecommendations: {
      logistics: string[]
    }
  }
  products: Product[]
  categories: Array<{ id: string; name: string }>
}

// ─── Placeholder ────────────────────────────────────────────────────────────
const PALETTES = [
  { bg: '#1a0a2e', accent: '#7c3aed' },
  { bg: '#0a1f1a', accent: '#00A86B' },
  { bg: '#1a1000', accent: '#d97706' },
  { bg: '#0a0f1a', accent: '#2563eb' },
  { bg: '#1a0a0a', accent: '#dc2626' },
  { bg: '#0a1a1a', accent: '#0891b2' },
]

function ProductPlaceholder({ name, index }: { name: string; index: number }) {
  const p = PALETTES[index % PALETTES.length]
  const initials = name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: p.bg }}>
      <div className="text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white font-bold text-2xl"
          style={{ background: `${p.accent}22`, border: `1px solid ${p.accent}44` }}
        >
          <span style={{ color: p.accent }}>{initials}</span>
        </div>
        <p className="text-xs px-4 text-center leading-tight" style={{ color: `${p.accent}99` }}>
          {name}
        </p>
      </div>
    </div>
  )
}

// ─── Smart Image with shimmer + fallback ─────────────────────────────────────
function ProductImage({
  src,
  alt,
  index,
  className = '',
  hover = false,
  delay = 0,
}: {
  src?: string
  alt: string
  index: number
  className?: string
  hover?: boolean
  delay?: number
}) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(delay === 0)

  useState(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShouldLoad(true), delay)
      return () => clearTimeout(timer)
    }
  })

  if (!src || errored) {
    return <ProductPlaceholder name={alt} index={index} />
  }

  if (!shouldLoad) {
    return (
      <div
        className="absolute inset-0 animate-pulse"
        style={{ background: 'linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)' }}
      />
    )
  }

  return (
    <div className="w-full h-full relative">
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ background: 'linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)' }}
        />
      )}
      <img
        src={src}
        alt={alt}
        width={512}
        height={512}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        className={`w-full h-full object-cover transition-all duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${hover ? 'group-hover:scale-105' : ''} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </div>
  )
}

// ─── Variant groups helper ────────────────────────────────────────────────────
function getVariantGroups(product: Product): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  product.variants.forEach((v) => {
    if (!groups[v.name]) groups[v.name] = []
    if (!groups[v.name].includes(v.value)) groups[v.name].push(v.value)
  })
  return groups
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StorefrontClient({ store }: { store: StoreData }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  const categories = ['All', ...store.categories.map((c) => c.name)]

  const filteredProducts =
    activeCategory === 'All'
      ? store.products
      : store.products.filter((p) => p.category === activeCategory)

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.product.id !== id))

  const updateQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      )
    )

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)
  const totalAmount = cart.reduce(
    (s, i) => s + parseFloat(i.product.price) * i.quantity,
    0
  )
  const currency = store.products[0]?.currency || 'GHS'

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#e5e7eb' }}>

      {/* ── NAV ── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-sm"
        style={{ borderBottom: '1px solid #1a1a1a', background: '#0a0a0acc' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">{store.name}</h1>
            <p className="text-xs" style={{ color: '#00A86B' }}>{store.businessType}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              style={{ background: '#111', border: '1px solid #1f1f1f' }}
            >
              <Search size={15} style={{ color: '#6b7280' }} />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all cursor-pointer"
              style={{ background: '#111', border: '1px solid #1f1f1f', color: '#e5e7eb' }}
            >
              <ShoppingCart size={15} />
              <span>Cart</span>
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-black"
                  style={{ background: '#00A86B' }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="max-w-7xl mx-auto px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer"
              style={{
                background: activeCategory === cat ? '#00A86B' : '#111',
                color: activeCategory === cat ? '#000' : '#6b7280',
                border: `1px solid ${activeCategory === cat ? '#00A86B' : '#1f1f1f'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,168,107,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,107,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <span
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: '#00A86B' }}
          >
            // {store.businessType}
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-white mt-3 mb-3 leading-tight">
            {store.name}
          </h2>
          <p className="mb-6" style={{ color: '#6b7280' }}>
            For {store.targetAudience}
          </p>
          <div className="flex flex-wrap gap-2">
            {store.canonical.storeFeatures.slice(0, 4).map((f) => (
              <span
                key={f}
                className="text-xs px-3 py-1.5 rounded-full font-mono"
                style={{
                  background: '#00A86B11',
                  border: '1px solid #00A86B33',
                  color: '#00A86B',
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-mono" style={{ color: '#00A86B' }}>
              // products
            </span>
            <h3 className="text-white font-semibold text-lg mt-0.5">
              {filteredProducts.length} items
              {activeCategory !== 'All' && ` · ${activeCategory}`}
            </h3>
          </div>
          <span className="text-xs font-mono" style={{ color: '#374151' }}>
            {store.canonical.recommendedTechStack.paymentGateways.join(' · ')}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedProduct(product)}
              className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300"
              style={{ background: '#111', border: '1px solid #1a1a1a' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00A86B44')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
            >
              {/* Product Image */}
              <div
                className="aspect-square relative overflow-hidden"
                style={{ background: '#0d0d0d' }}
              >
                <ProductImage
                  src={product.images?.[0]?.url}
                  alt={product.name}
                  index={i}
                  hover
                  delay={i * 800}
                />
                <div className="absolute top-2 left-2">
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{
                      background: '#00000088',
                      border: '1px solid #ffffff11',
                      color: '#9ca3af',
                    }}
                  >
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h4 className="font-semibold text-white text-sm leading-tight mb-1 line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-xs mb-3 line-clamp-2" style={{ color: '#4b5563' }}>
                  {product.description}
                </p>

                {/* Variant pills preview */}
                {product.variants.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {Object.entries(getVariantGroups(product))
                      .slice(0, 1)
                      .flatMap(([, vals]) =>
                        vals.slice(0, 3).map((val) => (
                          <span
                            key={val}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: '#1a1a1a', color: '#6b7280' }}
                          >
                            {val}
                          </span>
                        ))
                      )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">
                    {currency} {parseFloat(product.price).toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addToCart(product)
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    style={{ background: '#00A86B', color: '#000' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#00c47a')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#00A86B')}
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* ── PRODUCT MODAL ── */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: '#111', border: '1px solid #1f1f1f' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal image */}
              <div className="aspect-video relative overflow-hidden" style={{ background: '#0d0d0d' }}>
                <ProductImage
                  src={selectedProduct.images?.[0]?.url}
                  alt={selectedProduct.name}
                  index={store.products.findIndex((p) => p.id === selectedProduct.id)}
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white text-xl leading-tight">
                      {selectedProduct.name}
                    </h3>
                    <span className="text-xs font-mono" style={{ color: '#00A86B' }}>
                      {selectedProduct.category}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="transition-colors hover:text-white cursor-pointer"
                    style={{ color: '#374151' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-sm mb-5 leading-relaxed" style={{ color: '#6b7280' }}>
                  {selectedProduct.description}
                </p>

                {/* Variant selectors */}
                {Object.entries(getVariantGroups(selectedProduct)).map(([name, values]) => (
                  <div key={name} className="mb-4">
                    <p className="text-xs font-mono mb-2" style={{ color: '#4b5563' }}>
                      {name.toUpperCase()}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {values.map((val) => {
                        const key = `${selectedProduct.id}-${name}`
                        const isSelected = selectedVariants[key] === val
                        return (
                          <button
                            key={val}
                            onClick={() =>
                              setSelectedVariants((prev) => ({ ...prev, [key]: val }))
                            }
                            className="px-3 py-1.5 text-sm rounded-lg transition-all font-mono cursor-pointer"
                            style={{
                              background: isSelected ? '#00A86B' : '#1a1a1a',
                              color: isSelected ? '#000' : '#9ca3af',
                              border: `1px solid ${isSelected ? '#00A86B' : '#2a2a2a'}`,
                            }}
                          >
                            {val}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Tags */}
                {selectedProduct.tags?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mb-5">
                    {selectedProduct.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full font-mono"
                        style={{
                          background: '#00A86B0d',
                          border: '1px solid #00A86B22',
                          color: '#00A86B',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className="flex items-center justify-between pt-4"
                  style={{ borderTop: '1px solid #1a1a1a' }}
                >
                  <div>
                    <p className="text-xs font-mono mb-0.5" style={{ color: '#4b5563' }}>
                      PRICE
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {currency} {parseFloat(selectedProduct.price).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(selectedProduct)
                      setSelectedProduct(null)
                    }}
                    className="flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer"
                    style={{ background: '#00A86B', color: '#000' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#00c47a')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#00A86B')}
                  >
                    Add to Cart <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CART DRAWER ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 cursor-pointer"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 flex flex-col"
              style={{ background: '#0d0d0d', borderLeft: '1px solid #1a1a1a' }}
            >
              {/* Cart header */}
              <div
                className="flex items-center justify-between p-5"
                style={{ borderBottom: '1px solid #1a1a1a' }}
              >
                <div>
                  <h2 className="font-bold text-white">Cart</h2>
                  <p className="text-xs font-mono" style={{ color: '#00A86B' }}>
                    {totalItems} items
                  </p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="hover:text-white transition-colors cursor-pointer"
                  style={{ color: '#4b5563' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: '#111', border: '1px solid #1f1f1f' }}
                    >
                      <ShoppingCart size={24} style={{ color: '#374151' }} />
                    </div>
                    <p className="text-sm" style={{ color: '#4b5563' }}>
                      Your cart is empty
                    </p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="mt-4 text-sm font-medium cursor-pointer"
                      style={{ color: '#00A86B' }}
                    >
                      Continue shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 p-3 rounded-xl"
                      style={{ background: '#111', border: '1px solid #1a1a1a' }}
                    >
                      {/* Cart thumbnail */}
                      <div
                        className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: '#0d0d0d' }}
                      >
                        <ProductImage
                          src={item.product.images?.[0]?.url}
                          alt={item.product.name}
                          index={store.products.findIndex(
                            (p) => p.id === item.product.id
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs font-mono" style={{ color: '#00A86B' }}>
                          {currency} {parseFloat(item.product.price).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(item.product.id, -1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                            style={{ background: '#1a1a1a', color: '#9ca3af' }}
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-sm font-mono text-white w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.product.id, 1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                            style={{ background: '#1a1a1a', color: '#9ca3af' }}
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-between">
                        <p className="font-bold text-white text-sm">
                          {currency}{' '}
                          {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="transition-colors cursor-pointer"
                          style={{ color: '#374151' }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = '#ef4444')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = '#374151')
                          }
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart footer */}
              {cart.length > 0 && (
                <div
                  className="p-5 space-y-3"
                  style={{ borderTop: '1px solid #1a1a1a' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono" style={{ color: '#6b7280' }}>
                      Subtotal
                    </span>
                    <span className="font-bold text-white">
                      {currency} {totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {store.canonical.additionalRecommendations?.logistics?.[0] && (
                    <div
                      className="flex items-center gap-1.5 text-xs font-mono py-2 px-3 rounded-lg"
                      style={{ background: '#00A86B0d', border: '1px solid #00A86B22' }}
                    >
                      <Truck size={12} style={{ color: '#00A86B' }} />
                      <span style={{ color: '#00A86B' }}>
                        {store.canonical.additionalRecommendations.logistics[0]}
                      </span>
                    </div>
                  )}

                  <button
                    className="w-full font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm cursor-pointer"
                    style={{ background: '#00A86B', color: '#000' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = '#00c47a')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = '#00A86B')
                    }
                  >
                    Checkout with Paystack <ArrowRight size={15} />
                  </button>
                  <p
                    className="text-center text-xs font-mono"
                    style={{ color: '#374151' }}
                  >
                    Powered by Seltra ·{' '}
                    {store.canonical.recommendedTechStack.paymentGateways[0]}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}