// apps/web/components/ui/index.tsx
'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

// ── Logo ──────────────────────────────────────────────────────────────────────
export function SeltraLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 22 : size === 'lg' ? 36 : 28
  const t = size === 'sm' ? 16 : size === 'lg' ? 24 : 20

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: s, height: s,
        background: 'var(--green)',
        borderRadius: 7,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 16 16" fill="none">
          <path d="M8 2L14 8L8 14L2 8L8 2Z" stroke="#000" strokeWidth="1.5" fill="none"/>
          <path d="M8 5L11 8L8 11L5 8L8 5Z" fill="#000"/>
        </svg>
      </div>
      <span style={{
        fontSize: t,
        fontWeight: 700,
        color: 'var(--text)',
        letterSpacing: '-0.02em',
      }}>
        seltra
      </span>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <Loader2
      size={size}
      color={color}
      style={{ animation: 'spin 0.8s linear infinite' }}
    />
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({
  children,
  variant = 'default',
  style,
  className,
}: {
  children: React.ReactNode
  variant?: 'default' | 'green' | 'red' | 'yellow' | 'ghost'
  style?: React.CSSProperties
  className?: string
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: '#1a1a1a', color: 'var(--text-2)', border: '1px solid var(--border)' },
    green: { background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-border)' },
    red: { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' },
    yellow: { background: 'rgba(234,179,8,0.1)', color: '#facc15', border: '1px solid rgba(234,179,8,0.2)' },
    ghost: { background: 'transparent', color: 'var(--text-3)', border: '1px solid var(--border)' },
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 500,
      fontFamily: "'JetBrains Mono', monospace",
      ...styles[variant],
      ...style,
    }}>
      {children}
    </span>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({
  children,
  style,
  className,
  onClick,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (!label) return (
    <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <input className="input-base" {...props} />
      {error && (
        <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>
      )}
    </div>
  )
}

// ── Metric card ───────────────────────────────────────────────────────────────
export function MetricCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string
  value: string | number
  delta?: string
  icon?: React.ReactNode
}) {
  const isPositive = delta?.startsWith('+')

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>
          {label}
        </span>
        {icon && (
          <div style={{ color: 'var(--green)', opacity: 0.7 }}>{icon}</div>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 12, color: isPositive ? 'var(--green)' : '#f87171', fontFamily: "'JetBrains Mono', monospace" }}>
          {delta} vs last period
        </div>
      )}
    </div>
  )
}

// ── Status dot ────────────────────────────────────────────────────────────────
export function StatusDot({ status }: { status: 'live' | 'building' | 'paused' | 'error' }) {
  const colors = {
    live: 'var(--green)',
    building: '#facc15',
    paused: 'var(--text-3)',
    error: '#f87171',
  }

  return (
    <span style={{
      display: 'inline-block',
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: colors[status],
      boxShadow: status === 'live' ? `0 0 6px ${colors.live}` : undefined,
    }} />
  )
}