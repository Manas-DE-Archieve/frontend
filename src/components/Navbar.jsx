import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

const LANGS = [
  { code: 'ru', label: 'РУС' },
  { code: 'ky', label: 'КЫР' },
  { code: 'en', label: 'ENG' },
]

export default function Navbar({ onOpenLogin }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`relative px-3 py-1.5 text-sm font-medium tracking-wide transition-colors duration-150 ${pathname === to
          ? 'text-primary-300'
          : 'text-slate-300 hover:text-white'
        }`}
    >
      {label}
      {pathname === to && (
        <span className="absolute bottom-0 left-0 right-0 h-px bg-primary-300 rounded-full" />
      )}
    </Link>
  )

  return (
    <nav className="bg-primary-900 text-white border-b border-primary-800 shadow-lg">
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary-300/40 to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex items-center justify-center w-7 h-7 rounded border border-white/20 group-hover:border-white/40 transition-colors">
            <span className="text-primary-300 text-xs font-serif font-bold">А</span>
          </div>
          <div className="leading-none">
            <span className="block text-sm font-serif font-semibold text-white tracking-wide">
              {t('app.title')}
            </span>
            <span className="block text-slate-400 text-[10px] tracking-wider hidden sm:block mt-px">
              {t('app.subtitle')}
            </span>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-700 hidden sm:block" />

        {/* Nav links */}
        <div className="flex items-center gap-0.5 flex-1">
          {navLink('/', t('nav.home'))}
          {navLink('/chat', t('nav.chat'))}
          {navLink('/documents', t('nav.documents'))}
          {['moderator', 'super_admin'].includes(user?.role) && navLink('/admin', t('nav.admin'))}
        </div>

        {/* Lang switcher */}
        <div className="flex items-center gap-1">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => i18n.changeLanguage(l.code)}
              className={`px-2 py-1 rounded text-[10px] font-semibold tracking-widest transition-colors duration-150 ${i18n.language === l.code
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-slate-500 hidden md:block truncate max-w-[140px]">
              {user.email}
            </span>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 text-xs font-medium hover:border-slate-400 hover:text-white transition-colors"
            >
              {t('nav.logout')}
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="shrink-0 px-4 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold tracking-wide hover:bg-primary-500 transition-colors shadow-sm"
          >
            {t('nav.login')}
          </button>
        )}
      </div>
    </nav>
  )
}