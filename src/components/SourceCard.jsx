import { useState } from 'react'

export default function SourceCard({ source, onOpenDoc }) {
  const [expanded, setExpanded] = useState(false)
  const pct = Math.round((source.score ?? 0) * 100)
  const isHigh = pct > 75

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 text-xs animate-fade-in overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 min-w-0 flex-1 text-left hover:text-slate-900 transition-colors"
        >
          <span className="text-slate-400 shrink-0">📄</span>
          <span className="font-semibold text-slate-700 truncate">{source.document_name}</span>
          <span className="text-slate-300 shrink-0">{expanded ? '▲' : '▼'}</span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            isHigh ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                   : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
          }`}>
            {pct}%
          </div>
          {source.document_id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDoc(source.document_id); // ВЫЗЫВАЕМ ОТКРЫТИЕ МОДАЛКИ
              }}
              className="text-indigo-400 hover:text-indigo-600 transition-colors text-[11px] font-medium px-1.5 py-0.5 rounded hover:bg-indigo-100"
              title="Просмотреть документ"
            >
              ↗
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-2.5 border-t border-slate-200 pt-2">
          <p className="text-slate-500 leading-relaxed italic border-l-2 border-slate-200 pl-2.5 line-clamp-4">
            {source.chunk_text}
          </p>
        </div>
      )}
    </div>
  )
}