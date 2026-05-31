// apps/web/app/(auth)/layout.tsx
import { SeltraLogo } from '@/components/ui'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--darker)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      {/* Radial aurora glow — from concept auth-aurora */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: `
          radial-gradient(60% 50% at 20% 20%, rgba(0,168,107,0.18) 0%, transparent 60%),
          radial-gradient(50% 50% at 80% 30%, rgba(0,168,107,0.10) 0%, transparent 60%),
          radial-gradient(50% 50% at 50% 90%, rgba(0,168,107,0.14) 0%, transparent 60%)
        `,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <SeltraLogo />
          </Link>
        </div>

        {children}

        <p style={{
          textAlign: 'center', marginTop: 24,
          fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6,
        }}>
          By continuing you agree to our{' '}
          <Link href="#" style={{ color: 'var(--green)', textDecoration: 'none' }}>Terms</Link>
          {' '}and{' '}
          <Link href="#" style={{ color: 'var(--green)', textDecoration: 'none' }}>Privacy</Link>.
        </p>
      </div>
    </div>
  )
}