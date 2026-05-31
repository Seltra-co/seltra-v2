//apps/web/app/(dashboard)/layout.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Store, ShoppingBag, Package, FileText,
  Tag, BarChart3, Mail, FlaskConical, Plug,
  Settings, HelpCircle, LogOut, Plus, ChevronDown,
  ExternalLink
} from 'lucide-react'
import { SeltraLogo, StatusDot, Badge } from '@/components/ui'

// ── Types ─────────────────────────────────────────────────────────────────────
interface StoreEntry {
  id: string
  name: string
  slug: string
  status: 'live' | 'building' | 'paused'
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_MAIN = [
  { href: '/dashboard', label: 'Home', icon: Home, exact: true },
  { href: '/dashboard/store', label: 'Store', icon: Store },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/content', label: 'Content', icon: FileText },
  { href: '/dashboard/discounts', label: 'Discounts', icon: Tag },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/emails', label: 'Emails', icon: Mail },
  { href: '/dashboard/ab-testing', label: 'A/B Testing', icon: FlaskConical },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Plug },
]

const NAV_BOTTOM = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/support', label: 'Support', icon: HelpCircle },
]

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({
  stores,
  activeStore,
  onStoreSwitch,
  onSignOut,
  userName,
  userEmail,
}: {
  stores: StoreEntry[]
  activeStore: StoreEntry | null
  onStoreSwitch: (store: StoreEntry) => void
  onSignOut: () => void
  userName: string
  userEmail: string
}) {
  const pathname = usePathname()
  const [storeMenuOpen, setStoreMenuOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      height: '100vh',
      background: '#080808',
      borderRight: '1px solid #141414',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 30,
      overflow: 'hidden',
    }}>

      {/* Logo + store switcher */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid #141414' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <SeltraLogo size="sm" />
          <Badge variant="ghost">beta</Badge>
        </div>

        {/* Store switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setStoreMenuOpen(o => !o)}
            style={{
              width: '100%', background: '#111', border: '1px solid #1a1a1a',
              borderRadius: 8, padding: '8px 10px',
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
          >
            {activeStore && <StatusDot status={activeStore.status} />}
            <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeStore?.name || 'Select store'}
            </span>
            <ChevronDown size={13} color="var(--text-3)" />
          </button>

          {storeMenuOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: '#111', border: '1px solid #1f1f1f', borderRadius: 8,
              zIndex: 50, overflow: 'hidden',
            }}>
              {stores.map(s => (
                <button
                  key={s.id}
                  onClick={() => { onStoreSwitch(s); setStoreMenuOpen(false) }}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit',
                    fontSize: 13, textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#161616' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                >
                  <StatusDot status={s.status} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  {s.id === activeStore?.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />}
                </button>
              ))}

              <div style={{ borderTop: '1px solid #1a1a1a', margin: '4px 0' }} />
              <Link
                href="/dashboard/new-store"
                onClick={() => setStoreMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', fontSize: 13, color: 'var(--green)',
                  textDecoration: 'none', transition: 'background 0.1s',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = '#0a1a0a' }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = 'none' }}
              >
                <Plus size={13} /> New store
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }} className="scrollbar-hide">
        {NAV_MAIN.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 7,
                fontSize: 13, fontWeight: active ? 500 : 400,
                color: active ? 'var(--text)' : 'var(--text-3)',
                background: active ? '#141414' : 'transparent',
                textDecoration: 'none', marginBottom: 1,
                transition: 'background 0.1s, color 0.1s',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                if (!active) e.currentTarget.style.background = '#0e0e0e'
                if (!active) e.currentTarget.style.color = 'var(--text-2)'
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                if (!active) e.currentTarget.style.background = 'transparent'
                if (!active) e.currentTarget.style.color = 'var(--text-3)'
              }}
            >
              <item.icon size={15} color={active ? 'var(--green)' : 'currentColor'} />
              {item.label}
            </Link>
          )
        })}

        {/* History section */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #141414' }}>
          <div style={{ fontSize: 10, color: '#333', fontFamily: "'JetBrains Mono', monospace", padding: '0 10px', marginBottom: 6, letterSpacing: '0.08em' }}>
            HISTORY
          </div>
          <Link href="/dashboard/new-store" style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 7,
            fontSize: 13, color: 'var(--green)',
            textDecoration: 'none', marginBottom: 2,
          }}>
            <Plus size={13} /> New store
          </Link>
          {stores.map(s => (
            <button
              key={s.id}
              onClick={() => onStoreSwitch(s)}
              style={{
                width: '100%', background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 10px', borderRadius: 7,
                fontSize: 12, color: 'var(--text-3)',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                transition: 'color 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)' }}
            >
              <FileText size={12} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom: user + settings */}
      <div style={{ padding: '8px 8px 12px', borderTop: '1px solid #141414' }}>
        {NAV_BOTTOM.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 7,
              fontSize: 13, color: 'var(--text-3)',
              textDecoration: 'none', marginBottom: 1,
              transition: 'color 0.1s',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'var(--text-3)' }}
          >
            <item.icon size={15} />
            {item.label}
          </Link>
        ))}

        {/* User row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '10px 10px 4px', marginTop: 4,
          borderTop: '1px solid #141414',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--green-dim)', border: '1px solid var(--green-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: 'var(--green)',
            flexShrink: 0,
          }}>
            {userName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail}
            </div>
          </div>
          <button
            onClick={onSignOut}
            title="Sign out"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', padding: 2, display: 'flex',
              transition: 'color 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}

// ── Main layout ───────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [stores, setStores] = useState<StoreEntry[]>([])
  const [activeStore, setActiveStore] = useState<StoreEntry | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    // Load session
    try {
      const s = localStorage.getItem('seltra_session')
      if (!s) { router.push('/sign-in'); return }

      const sess = JSON.parse(s)
      if (!sess?.token) { router.push('/sign-in'); return }

      setUserName(sess.user?.name || '')
      setUserEmail(sess.user?.email || '')
    } catch {
      router.push('/sign-in')
      return
    }

    // Load stores from API
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const s = localStorage.getItem('seltra_session')
      const sess = s ? JSON.parse(s) : null
      const token = sess?.token

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/seltra/store`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()

      const storeList: StoreEntry[] = (Array.isArray(data) ? data : data.data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        status: t.status === 'active' ? 'live' : 'paused',
      }))

      setStores(storeList)
      if (storeList.length > 0) {
        // Use activeTenantId from session if present
        const activeTenantId = sess?.activeTenantId
        const active = activeTenantId
          ? storeList.find(s => s.id === activeTenantId) || storeList[0]
          : storeList[0]
        setActiveStore(active)
      }
    } catch {
      // API might not have auth yet — continue with empty state
    }
  }

  const handleStoreSwitch = (store: StoreEntry) => {
    setActiveStore(store)
    try {
      const s = localStorage.getItem('seltra_session')
      if (s) {
        const sess = JSON.parse(s)
        sess.activeTenantId = store.id
        localStorage.setItem('seltra_session', JSON.stringify(sess))
      }
    } catch { /* ignore */ }
  }

  const handleSignOut = () => {
    localStorage.removeItem('seltra_session')
    localStorage.removeItem('seltra_onboarding')
    router.push('/sign-in')
  }

  // Expose activeStore to children via a data attribute on window (simple MVP approach)
  useEffect(() => {
    if (activeStore) {
      (window as any).__seltra_active_store = activeStore
    }
  }, [activeStore])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--dark)' }}>
      <Sidebar
        stores={stores}
        activeStore={activeStore}
        onStoreSwitch={handleStoreSwitch}
        onSignOut={handleSignOut}
        userName={userName}
        userEmail={userEmail}
      />

      {/* Main content — offset by sidebar width */}
      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh', overflow: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}