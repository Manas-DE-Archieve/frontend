import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Compact source chip used inside a message.
 * - Click header arrow → expand text snippet
 * - Click ↗ → open document viewer
 */
export default function SourceCard({ source }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const pct = Math.round((source.score ?? 0) * 100)
  const isHigh = pct > 75

  return (
    <div className={`rounded-lg border text-xs transition-all ${open ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-200 bg-slate-50'}`}>
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Filename toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
        >
          <span className="text-slate-400 shrink-0">📄</span>
          <span className="font-medium text-slate-700 truncate">{source.document_name}</span>
          <span className={`text-slate-300 shrink-0 transition-transform text-[10px] ${open ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {/* Score badge */}
        <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
          isHigh ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                 : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
        }`}>{pct}%</span>

        {/* Open document */}
        {source.document_id && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/documents?view=${source.document_id}`) }}
            className="shrink-0 text-indigo-400 hover:text-indigo-600 font-medium px-1 rounded hover:bg-indigo-100 transition-colors"
            title="Открыть документ"
          >↗</button>
        )}
      </div>

      {/* Expandable snippet */}
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-200">
          <p className="text-slate-600 leading-relaxed italic border-l-2 border-indigo-200 pl-2.5 line-clamp-6">
            {source.chunk_text}
          </p>
        </div>
      )}
    </div>
  )
}