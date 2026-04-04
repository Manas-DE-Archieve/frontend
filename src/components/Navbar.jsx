import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

const LANGS = [
  { code: 'ru', label: 'РУС' },
  { code: 'ky', label: 'КЫР' },
  { code: 'en', label: 'ENG' },
]

const ArchiveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="5" rx="2"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/>
  </svg>
)
const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const DocsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const LoginIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
)
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const NAV_ITEMS = [
  { to: '/',          labelKey: 'nav.home',      Icon: ArchiveIcon },
  { to: '/chat',      labelKey: 'nav.chat',      Icon: ChatIcon },
  { to: '/documents', labelKey: 'nav.documents', Icon: DocsIcon },
]

export default function Navbar({ onOpenLogin }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const changeLang = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    setMenuOpen(false)
  }

  const navBg = 'linear-gradient(135deg, #1a3a5c 0%, #16304f 100%)'

  return (
    <>
      <nav className="sticky top-0 z-50 shadow-lg" style={{ background: navBg }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 no-underline" onClick={() => setMenuOpen(false)}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                 style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              📜
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="text-white font-serif font-bold text-sm tracking-wide">Архивдин Үнү</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, letterSpacing: 2 }}>{t('app.subtitle')}</div>
            </div>
            <div className="text-white font-serif font-bold text-sm tracking-wide sm:hidden">Архивдин Үнү</div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 ml-3">
            {NAV_ITEMS.map(({ to, labelKey, Icon }) => {
              const active = pathname === to
              return (
                <Link key={to} to={to}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all"
                  style={{ color: active ? '#fff' : 'rgba(255,255,255,0.6)', background: active ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
                  <Icon />{t(labelKey)}
                </Link>
              )
            })}
            {['moderator', 'super_admin'].includes(user?.role) && (
              <Link to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all"
                style={{ color: pathname === '/admin' ? '#fff' : 'rgba(255,255,255,0.6)', background: pathname === '/admin' ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
                <ShieldIcon />{t('nav.admin')}
              </Link>
            )}
          </div>

          {/* Spacer on mobile */}
          <div className="flex-1 md:hidden" />

          {/* Language switcher — desktop only */}
          <div className="hidden md:flex items-center gap-0.5 rounded-lg p-1" style={{ background: 'rgba(0,0,0,0.25)' }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => changeLang(l.code)}
                className="px-2.5 py-1 rounded-md border-0 cursor-pointer font-bold transition-all"
                style={{ fontSize: 10, letterSpacing: 1, background: i18n.language === l.code ? 'rgba(255,255,255,0.22)' : 'transparent', color: i18n.language === l.code ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Auth — desktop */}
          {user ? (
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <span className="text-xs truncate max-w-28" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</span>
              <button onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-all"
                style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}>
                <LogoutIcon />{t('nav.logout')}
              </button>
            </div>
          ) : (
            <button onClick={onOpenLogin}
              className="hidden md:flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white border-0 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #3b9edb, #2980b9)', boxShadow: '0 2px 8px rgba(41,128,185,0.4)' }}>
              <LoginIcon />{t('nav.login')}
            </button>
          )}

          {/* Mobile: login or avatar + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {!user && (
              <button onClick={onOpenLogin}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white border-0 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #3b9edb, #2980b9)' }}>
                <LoginIcon />{t('nav.login')}
              </button>
            )}
            <button onClick={() => setMenuOpen(v => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border-0 cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40" style={{ top: 56 }}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          {/* Menu panel */}
          <div className="absolute top-0 left-0 right-0 shadow-xl"
               style={{ background: 'linear-gradient(180deg, #1e3d5f 0%, #16304f 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>

            {/* Nav links */}
            <div className="px-4 pt-3 pb-2 space-y-1">
              {NAV_ITEMS.map(({ to, labelKey, Icon }) => {
                const active = pathname === to
                return (
                  <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl no-underline transition-all"
                    style={{ color: active ? '#fff' : 'rgba(255,255,255,0.7)', background: active ? 'rgba(255,255,255,0.15)' : 'transparent', fontSize: 15, fontWeight: 500 }}>
                    <Icon />{t(labelKey)}
                  </Link>
                )
              })}
              {['moderator', 'super_admin'].includes(user?.role) && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl no-underline"
                  style={{ color: pathname === '/admin' ? '#fff' : 'rgba(255,255,255,0.7)', background: pathname === '/admin' ? 'rgba(255,255,255,0.15)' : 'transparent', fontSize: 15, fontWeight: 500 }}>
                  <ShieldIcon />{t('nav.admin')}
                </Link>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 16px' }} />

            {/* Language + logout */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => changeLang(l.code)}
                    className="px-3 py-1.5 rounded-md border-0 cursor-pointer font-bold"
                    style={{ fontSize: 11, letterSpacing: 1, background: i18n.language === l.code ? 'rgba(255,255,255,0.22)' : 'transparent', color: i18n.language === l.code ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                    {l.label}
                  </button>
                ))}
              </div>
              {user && (
                <button onClick={() => { logout(); setMenuOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer border"
                  style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}>
                  <LogoutIcon />{t('nav.logout')}
                </button>
              )}
            </div>

            {user && (
              <div className="px-8 pb-3 text-center" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                {user.email}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}