import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { personsApi } from '../api'
import { useAuth } from '../hooks/useAuth'

export default function AdminPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data } = await personsApi.list({ status: 'pending', limit: 50 })
      setPersons(data.items)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const setStatus = async (id, status) => {
    await personsApi.setStatus(id, status)
    load()
  }

  if (!user || user.role === 'user') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-4xl mb-3 opacity-30">🔒</div>
        <p className="font-serif text-lg text-slate-400">Доступ запрещён</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary-800">{t('admin.title')}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('admin.pending')}:{' '}
            <strong className="text-slate-600">{persons.length}</strong>
          </p>
        </div>
        {persons.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-700">{persons.length} ожидают проверки</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 skeleton w-1/2 rounded mb-2" />
              <div className="h-3 skeleton w-1/3 rounded" />
            </div>
          ))}
        </div>
      ) : persons.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3 opacity-50">✓</p>
          <p className="font-serif text-slate-500">Все записи проверены</p>
          <p className="text-xs text-slate-400 mt-1">Нет записей, ожидающих проверки</p>
        </div>
      ) : (
        <div className="space-y-3">
          {persons.map(p => (
            <div key={p.id} className="card p-5 flex items-center gap-5 animate-fade-in">
              {/* Left accent */}
              <div className="w-0.5 h-12 bg-amber-300 rounded-full shrink-0" />

              <div className="flex-1 min-w-0">
                <Link
                  to={`/persons/${p.id}`}
                  className="font-serif font-semibold text-slate-800 hover:text-primary-700 transition-colors"
                >
                  {p.full_name}
                </Link>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {[p.birth_year, p.region, p.charge].filter(Boolean).join(' · ')}
                </p>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Добавлено: {new Date(p.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setStatus(p.id, 'verified')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  ✓ {t('admin.verify')}
                </button>
                <button
                  onClick={() => setStatus(p.id, 'rejected')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                >
                  ✗ {t('admin.reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
