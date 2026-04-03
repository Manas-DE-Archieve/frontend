import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { factsApi } from '../api'

function FactCard({ fact }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className={`card overflow-hidden transition-shadow ${open ? 'shadow-md' : 'hover:shadow-sm'}`}>
      {/* Clickable header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-5 pt-4 pb-3 flex items-start gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-indigo-50 ring-1 ring-indigo-100 flex items-center justify-center text-lg shrink-0">
          {fact.icon || '📖'}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 block mb-1">
            {fact.category}
          </span>
          <p className="font-serif font-semibold text-sm text-slate-800 leading-snug">
            {fact.title}
          </p>
        </div>
        <span className={`text-slate-300 text-[10px] shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* Expandable body + source */}
      {open && (
        <div className="px-5 pb-4 pt-1 border-t border-slate-100 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">{fact.body}</p>

          {fact.source_filename && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Источник:</span>
              <button
                onClick={() => fact.document_id && navigate(`/documents?view=${fact.document_id}`)}
                className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors ${
                  fact.document_id
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer'
                    : 'bg-slate-100 text-slate-500 cursor-default'
                }`}
              >
                📄 {fact.source_filename}
                {fact.document_id && <span className="text-indigo-400">↗</span>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const PAGE_SIZE = 12

export default function FactsTab() {
  const [facts, setFacts]   = useState([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [loading, setLoading] = useState(true)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data } = await factsApi.get({ page: p, limit: PAGE_SIZE })
      setFacts(data.items || [])
      setTotal(data.total)
      setPage(p)
    } catch {
      setFacts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-primary-300/50" />
          <p className="font-serif font-semibold text-slate-800 text-sm">Знаете ли вы?</p>
          {!loading && total > 0 && (
            <span className="text-xs text-slate-400">— {total} фактов из архива</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 skeleton rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 skeleton rounded w-1/4" />
                  <div className="h-4 skeleton rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : facts.length === 0 ? (
        <div className="card p-14 text-center">
          <p className="text-3xl mb-3 opacity-40">📚</p>
          <p className="text-sm text-slate-500">Факты ещё не сгенерированы</p>
          <p className="text-xs text-slate-400 mt-1">Загрузите документы, и факты появятся автоматически</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {facts.map(f => <FactCard key={f.id} fact={f} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={page === 1}
                onClick={() => load(page - 1)}
                className="btn-outline !text-xs !py-1.5 !px-3 disabled:opacity-40"
              >← Назад</button>
              <span className="text-xs text-slate-400">{page} / {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => load(page + 1)}
                className="btn-outline !text-xs !py-1.5 !px-3 disabled:opacity-40"
              >Далее →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}