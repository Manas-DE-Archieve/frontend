import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

const LANGS = [
  { code: 'ru', label: '🇷🇺 Рус' },
  { code: 'ky', label: '🇰🇬 Кыр' },
  { code: 'en', label: '🇬🇧 Eng' },
]

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        pathname === to
          ? 'bg-primary-500 text-white'
          : 'text-stone-300 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-primary-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-gold text-lg font-bold tracking-tight">
            {t('app.title')}
          </span>
          <span className="text-stone-400 text-xs hidden sm:block">
            {t('app.subtitle')}
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          {navLink('/', t('nav.home'))}
          {navLink('/chat', t('nav.chat'))}
          {navLink('/documents', t('nav.documents'))}
          {user?.role !== 'user' && navLink('/admin', t('nav.admin'))}
        </div>

        {/* Lang switcher */}
        <div className="flex gap-1">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => i18n.changeLanguage(l.code)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                i18n.language === l.code
                  ? 'bg-gold text-primary-900 font-semibold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-stone-400 hidden md:block">{user.email}</span>
            <button onClick={logout} className="btn-outline !text-stone-300 !border-stone-600 !text-xs">
              {t('nav.logout')}
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary !text-xs shrink-0">
            {t('nav.login')}
          </Link>
        )}
      </div>
    </nav>
  )
}
