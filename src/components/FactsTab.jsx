import { useState, useEffect } from 'react'
import { factsApi } from '../api'

const SKELETON = Array(6).fill(null)

export default function FactsTab() {
  const [facts, setFacts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await factsApi.get()
      setFacts(data.facts || [])
      setStats(data.db_stats)
    } catch {
      setError('Не удалось загрузить факты. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      {stats && !loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Записей в архиве', value: stats.total?.toLocaleString() },
            { label: 'Реабилитировано', value: stats.rehabilitated?.toLocaleString() },
            { label: 'Регионов', value: stats.regions },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className="font-serif text-2xl font-bold text-primary-700">{s.value ?? '—'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-primary-300/50" />
          <p className="font-serif font-semibold text-slate-800 text-sm">Знаете ли вы?</p>
        </div>
        {!loading && (
          <button
            onClick={load}
            className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            🔄 Обновить
          </button>
        )}
      </div>

      {error && (
        <div className="card p-5 text-center text-sm text-red-500">{error}</div>
      )}

      {/* Facts grid */}
      <div className="space-y-3">
        {loading
          ? SKELETON.map((_, i) => (
              <div key={i} className="card p-5 space-y-2 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 skeleton rounded-lg" />
                  <div className="h-4 skeleton rounded w-1/3" />
                </div>
                <div className="h-3 skeleton rounded w-full" />
                <div className="h-3 skeleton rounded w-4/5" />
              </div>
            ))
          : facts.map((fact, i) => (
              <div key={i} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 ring-1 ring-indigo-100 flex items-center justify-center text-lg shrink-0">
                    {fact.icon || '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                        {fact.category}
                      </span>
                    </div>
                    <p className="font-serif font-semibold text-sm text-slate-800 mb-1.5">{fact.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{fact.body}</p>
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      {!loading && facts.length === 0 && !error && (
        <div className="card p-10 text-center">
          <p className="text-3xl mb-3 opacity-40">📚</p>
          <p className="text-sm text-slate-500">Нет данных для отображения</p>
        </div>
      )}
    </div>
  )
}