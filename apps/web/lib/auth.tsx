// apps/web/lib/auth.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string
  image?: string
}

export interface Session {
  user: User
  token: string
  expiresAt: string
}

interface AuthState {
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useSession() {
  const { session, loading } = useAuth()
  return { session, loading }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('seltra_session')
      if (stored) {
        const parsed = JSON.parse(stored) as Session
        // Check expiry
        if (new Date(parsed.expiresAt) > new Date()) {
          setSession(parsed)
        } else {
          localStorage.removeItem('seltra_session')
        }
      }
    } catch {
      localStorage.removeItem('seltra_session')
    } finally {
      setLoading(false)
    }
  }, [])

  const saveSession = (s: Session) => {
    setSession(s)
    localStorage.setItem('seltra_session', JSON.stringify(s))
  }

  const clearSession = () => {
    setSession(null)
    localStorage.removeItem('seltra_session')
    localStorage.removeItem('seltra_onboarding')
  }

  // ── Sign in ────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        return { error: data.message || 'Invalid credentials' }
      }

      saveSession(data.session)
      return {}
    } catch {
      return { error: 'Connection failed. Check your network.' }
    }
  }, [])

  // ── Sign up ────────────────────────────────────────────────────────────────
  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/auth/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        return { error: data.message || 'Sign up failed' }
      }

      saveSession(data.session)
      return {}
    } catch {
      return { error: 'Connection failed. Check your network.' }
    }
  }, [])

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    // In MVP: redirect to backend OAuth initiation endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/auth/google`
  }, [])

  // ── Sign out ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/auth/sign-out`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.token}` },
      })
    } catch {
      // ignore
    } finally {
      clearSession()
      window.location.href = '/sign-in'
    }
  }, [session?.token])

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── API helper ────────────────────────────────────────────────────────────────
export function useApi() {
  const { session } = useAuth()

  const call = useCallback(async (path: string, options?: RequestInit) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...(options?.headers ?? {}),
      },
    })
    return res.json()
  }, [session?.token])

  return { call }
}

// ── Onboarding state ──────────────────────────────────────────────────────────
export interface OnboardingState {
  analytics_consent?: boolean
  business_category?: string
  product_status?: string
  revenue_bracket?: string
  location?: string
  onboarding_completed?: boolean
  onboarding_step?: number
}

export function useOnboarding() {
  const getState = (): OnboardingState => {
    try {
      const stored = localStorage.getItem('seltra_onboarding')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  const saveState = (data: Partial<OnboardingState>) => {
    const current = getState()
    const next = { ...current, ...data }
    localStorage.setItem('seltra_onboarding', JSON.stringify(next))
    return next
  }

  return { getState, saveState }
}