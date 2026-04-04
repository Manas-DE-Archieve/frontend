import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

export default function LoginModal({ onClose }) {
  const { t } = useTranslation()
  const { login, register } = useAuth()
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,30,57,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-700 shadow-card-lg mb-3">
            <span className="font-serif text-xl font-bold text-primary-200">А</span>
          </div>
          <h2 className="font-serif text-xl font-bold text-white">{t('app.title')}</h2>
          <p className="text-slate-400 text-xs mt-0.5">{t('app.subtitle')}</p>
        </div>

        <div className="card p-6 shadow-card-lg">
          {/* Tab switcher */}
          <div className="flex rounded-lg overflow-hidden border border-slate-200 mb-5 bg-slate-50">
            {['login', 'register'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 text-sm font-medium tracking-wide transition-all duration-150 ${
                  mode === m
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t(`auth.${m}`)}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="field-label block mb-1.5">{t('auth.email')}</label>
              <input
                className="input"
                type="email"
                required
                autoFocus
                placeholder="example@mail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label block mb-1.5">{t('auth.password')}</label>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <span className="shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center !py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t('common.loading')}
                </span>
              ) : t(`auth.${mode}Btn`)}
            </button>
          </form>
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          {t('person.cancel')}
        </button>
      </div>
    </div>
  )
}
