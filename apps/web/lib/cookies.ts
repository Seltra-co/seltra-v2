// apps/web/lib/cookies.ts
// The middleware runs server-side and can't read localStorage.
// So whenever we write to localStorage we also set a cookie.
// These helpers keep both in sync.

export function setAuthCookies(token: string, onboardingDone: boolean) {
  // Secure, SameSite=Lax — no HttpOnly so JS can also clear it
  const maxAge = 60 * 60 * 24 * 30 // 30 days

  document.cookie = [
    `seltra_token=${token}`,
    `path=/`,
    `max-age=${maxAge}`,
    `SameSite=Lax`,
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ].filter(Boolean).join('; ')

  document.cookie = [
    `seltra_onboarded=${onboardingDone}`,
    `path=/`,
    `max-age=${maxAge}`,
    `SameSite=Lax`,
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ].filter(Boolean).join('; ')
}

export function clearAuthCookies() {
  document.cookie = 'seltra_token=; path=/; max-age=0'
  document.cookie = 'seltra_onboarded=; path=/; max-age=0'
}

export function markOnboardingComplete() {
  const maxAge = 60 * 60 * 24 * 30
  document.cookie = [
    `seltra_onboarded=true`,
    `path=/`,
    `max-age=${maxAge}`,
    `SameSite=Lax`,
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ].filter(Boolean).join('; ')
}