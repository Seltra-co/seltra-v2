// apps/web/app/(auth)/sign-in/page.tsx
// add cookie setting after localStorage write.

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { Spinner } from '@/components/ui'
import { setAuthCookies } from '@/lib/cookies'

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function SignInPage() {
  const [mode, setMode] = useState<'options' | 'email'>('options')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/auth/sign-in`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }
      )
      const data = await res.json()
      if (!res.ok || !data.success) { setError(data.message || 'Invalid credentials'); setLoading(false); return }
      localStorage.setItem('seltra_session', JSON.stringify(data.session))
      const onboardingDone = data.session?.user?.merchant?.profile?.onboarding_completed === true
      setAuthCookies(data.session.token, onboardingDone)
      router.push(onboardingDone ? '/dashboard' : '/onboarding')
    } catch {
      setError('Connection failed. Is the API running?')
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/auth/google`
  }

  return (
    <div className="auth-card animate-fade-in" style={{ padding: '36px 32px' }}>
      <div style={{ width: 52, height: 52, background: 'var(--green)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <svg width={28} height={28} viewBox="0 0 16 16" fill="none">
          <path d="M8 2L14 8L8 14L2 8L8 2Z" stroke="#000" strokeWidth="1.5" fill="none"/>
          <path d="M8 5L11 8L8 11L5 8L8 5Z" fill="#000"/>
        </svg>
      </div>
      <h1 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>Sign in to your account</h1>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginBottom: 28 }}>Welcome back. Let&apos;s keep building.</p>

      {mode === 'options' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleGoogle} className="btn-ghost" style={{ background: '#fff', color: '#111', border: '1px solid #e5e7eb' }}>
            <GoogleIcon /> Continue with Google
          </button>
          <button onClick={() => setMode('email')} className="btn-ghost">
            <Mail size={16} /> Continue with Email
          </button>
          <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: 'var(--text-3)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button type="button" onClick={() => { setMode('options'); setError('') }}
            style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 4, fontFamily: 'inherit' }}>
            ← back
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Sign in with email</h2>
          <input type="email" className="input-base" placeholder="you@store.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          <input type="password" className="input-base" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#f87171' }}>{error}</div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><Spinner size={14} /> Signing in...</> : 'Sign in'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
          </p>
        </form>
      )}
    </div>
  )
}