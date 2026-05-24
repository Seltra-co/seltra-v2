//apps/storefront/app/store/[slug]/components/ProductImage.tsx
'use client'

import { useState, useEffect } from 'react'

const PALETTES = [
  { bg: '#1a0a2e', accent: '#7c3aed' },
  { bg: '#0a1f1a', accent: '#00A86B' },
  { bg: '#1a1000', accent: '#d97706' },
  { bg: '#0a0f1a', accent: '#2563eb' },
  { bg: '#1a0a0a', accent: '#dc2626' },
  { bg: '#0a1a1a', accent: '#0891b2' },
]

function Placeholder({ name, index }: { name: string; index: number }) {
  const p = PALETTES[index % PALETTES.length]
  const initials = name.split(' ').slice(0, 2).map((w: string) => w[0] || '').join('').toUpperCase()
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: p.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', background: `${p.accent}22`, border: `1px solid ${p.accent}44` }}>
          <span style={{ color: p.accent, fontWeight: 700, fontSize: 20 }}>{initials}</span>
        </div>
        <p style={{ fontSize: 10, color: `${p.accent}88`, maxWidth: 80, textAlign: 'center', lineHeight: 1.3 }}>{name}</p>
      </div>
    </div>
  )
}

interface ProductImageProps {
  src?: string
  alt: string
  index: number
  className?: string
  hover?: boolean
  delay?: number
}

export function ProductImage({ src, alt, index, hover = false, delay = 0 }: ProductImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(delay === 0)

  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setShouldLoad(true), delay)
      return () => clearTimeout(t)
    }
  }, [delay])

  if (!src || errored) return <Placeholder name={alt} index={index} />

  if (!shouldLoad) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)',
        animation: 'shimmer 1.5s infinite',
      }} />
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)',
        }} />
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          opacity: loaded ? 1 : 0,
          transform: hover ? 'scale(1)' : undefined,
          display: 'block',
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        onMouseEnter={hover ? (e) => { e.currentTarget.style.transform = 'scale(1.06)' } : undefined}
        onMouseLeave={hover ? (e) => { e.currentTarget.style.transform = 'scale(1)' } : undefined}
      />
    </div>
  )
}