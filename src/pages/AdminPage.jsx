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
    return <div className="text-center py-20 text-stone-400">Access denied</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
      <h1 className="text-2xl font-bold text-stone-800">{t('admin.title')}</h1>
      <p className="text-sm text-stone-500">{t('admin.pending')}: <strong>{persons.length}</strong></p>

      {loading ? (
        <p className="text-center py-12 text-stone-400">{t('common.loading')}</p>
      ) : persons.length === 0 ? (
        <div className="card p-12 text-center text-stone-400">
          <p className="text-3xl mb-2">✅</p>
          <p>Все записи проверены</p>
        </div>
      ) : persons.map(p => (
        <div key={p.id} className="card p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <Link to={`/persons/${p.id}`} className="font-semibold text-stone-800 hover:text-primary-600">
              {p.full_name}
            </Link>
            <p className="text-xs text-stone-500 mt-0.5">
              {p.birth_year} · {p.region} · {p.charge}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              Добавлено: {new Date(p.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setStatus(p.id, 'verified')}
              className="btn-primary !text-xs !py-1 !bg-green-600 hover:!bg-green-700"
            >
              ✓ {t('admin.verify')}
            </button>
            <button
              onClick={() => setStatus(p.id, 'rejected')}
              className="btn-outline !text-xs !text-red-600 !border-red-200 hover:!bg-red-50"
            >
              ✗ {t('admin.reject')}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
