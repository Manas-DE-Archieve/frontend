import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { factsApi } from '../api'

const STORAGE_KEY = 'archiv_seen_fact_ids'

function loadSeenIds() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveSeenIds(ids) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)) } catch {}
}

function FactCard({ fact }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className={`card overflow-hidden transition-all ${open ? 'shadow-md' : 'hover:shadow-sm'}`}>
      <button onClick={() => setOpen(v => !v)} className="w-full text-left px-5 pt-4 pb-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 ring-1 ring-indigo-100 flex items-center justify-center text-lg shrink-0">
          {fact.icon || '📖'}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 block mb-1">
            {fact.category}
          </span>
          <p className="font-serif font-semibold text-sm text-slate-800 leading-snug">{fact.title}</p>
        </div>
        <span className={`text-slate-300 text-[10px] shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="px-5 pb-4 pt-1 border-t border-slate-100 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">{fact.body}</p>
          {fact.source_filename && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">{t('facts.source')}</span>
              <button
                onClick={() => fact.document_id && navigate(`/documents?view=${fact.document_id}`)}
                className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors ${
                  fact.document_id
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer'
                    : 'bg-slate-100 text-slate-500 cursor-default'
                }`}
              >
                📄 {fact.source_filename}
                {fact.document_id && <span>↗</span>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FactsTab() {
  const { t } = useTranslation()
  const [facts, setFacts]       = useState([])
  const [total, setTotal]       = useState(0)
  const [remaining, setRemaining] = useState(null)
  const [seenIds, setSeenIds]   = useState(() => loadSeenIds())
  const [allRead, setAllRead]   = useState(false)
  const [loading, setLoading]   = useState(true)

  const load = async (currentSeen) => {
    setLoading(true)
    setAllRead(false)
    try {
      const { data } = await factsApi.get({
        limit: 6,
        seen_ids: currentSeen.join(','),
      })

      if (data.items.length === 0 && data.total > 0) {
        // All facts have been seen
        setAllRead(true)
        setFacts([])
      } else {
        setFacts(data.items)
        setTotal(data.total)
        setRemaining(data.remaining)

        // Mark these as seen
        const newIds = [...new Set([...currentSeen, ...data.items.map(f => f.id)])]
        setSeenIds(newIds)
        saveSeenIds(newIds)
      }
    } catch {
      setFacts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(loadSeenIds()) }, [])

  const handleRefresh = () => load(seenIds)

  const handleReset = () => {
    const empty = []
    setSeenIds(empty)
    saveSeenIds(empty)
    setAllRead(false)
    load(empty)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-primary-300/50" />
          <p className="font-serif font-semibold text-slate-800 text-sm">{t('facts.title')}</p>
          {!loading && total > 0 && (
            <span className="text-xs text-slate-400">
              {t('facts.readCount', { seen: Math.min(seenIds.length, total), total })}
            </span>
          )}
        </div>
        {!loading && !allRead && (
          <button
            onClick={handleRefresh}
            className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors font-medium"
          >
            {t('facts.more')}
          </button>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && !loading && (
        <div className="w-full bg-slate-100 rounded-full h-1">
          <div
            className="bg-indigo-400 h-1 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (seenIds.length / total) * 100)}%` }}
          />
        </div>
      )}

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
      ) : allRead ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-serif text-lg text-slate-700 mb-1">{t('facts.allRead')}</p>
          <p className="text-xs text-slate-400 mb-5">{t('facts.allReadSub', { count: total })}</p>
          <button onClick={handleReset} className="btn-outline !text-xs !py-2 !px-4">
            {t('facts.restart')}
          </button>
        </div>
      ) : facts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3 opacity-40">📚</p>
          <p className="text-sm text-slate-500">{t('facts.empty')}</p>
          <p className="text-xs text-slate-400 mt-1">{t('facts.emptySub')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {facts.map(f => <FactCard key={f.id} fact={f} />)}
          </div>

          <div className="flex items-center justify-between pt-1">
            {remaining !== null && remaining > 0 && (
              <p className="text-xs text-slate-400">{t('facts.remaining', { count: remaining })}</p>
            )}
            <button
              onClick={handleRefresh}
              className="btn-primary !text-xs !py-2 !px-4 ml-auto"
            >
              {t('facts.nextBatch')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}