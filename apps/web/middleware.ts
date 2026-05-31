//apps/web/middleware.ts
// NEW FILE — place at the ROOT of apps/web/ (same level as next.config.ts)
// i.e. apps/web/middleware.ts
//
// This runs on the Edge before every request.
// It does two things:
//   1. Redirects unauthenticated users away from /dashboard
//   2. Redirects authenticated users who haven't completed onboarding away from /dashboard

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED = ['/dashboard']

// Routes that require completed onboarding (subset of PROTECTED)
const REQUIRES_ONBOARDING = ['/dashboard']

// Routes that logged-in users should not see
const AUTH_ONLY = ['/sign-in', '/sign-up']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read session token from cookie (we'll set this cookie on sign-in)
  // In MVP we store in localStorage client-side, but middleware runs server-side
  // So we use a cookie named 'seltra_token' that we set alongside localStorage
  const token = request.cookies.get('seltra_token')?.value
  const onboardingDone = request.cookies.get('seltra_onboarded')?.value === 'true'

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAuthRoute = AUTH_ONLY.some(p => pathname.startsWith(p))

  // 1. Unauthenticated user hitting a protected route → sign in
  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // 2. Authenticated user who hasn't completed onboarding hitting dashboard → onboarding
  if (isProtected && token && !onboardingDone && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding'
    return NextResponse.redirect(url)
  }

  // 3. Already authenticated users hitting sign-in/sign-up → dashboard
  if (isAuthRoute && token && onboardingDone) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Run middleware on these paths only — skip static assets and API routes
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/sign-in',
    '/sign-up',
  ],
}