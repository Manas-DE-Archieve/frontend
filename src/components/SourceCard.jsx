import { useTranslation } from 'react-i18next'

export default function SourceCard({ source }) {
  const { t } = useTranslation()
  const pct = Math.round((source.score ?? 0) * 100)
  const isHigh = pct > 75

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs animate-fade-in">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-slate-400 shrink-0">📄</span>
          <span className="font-semibold text-slate-700 truncate">{source.document_name}</span>
        </div>
        <div className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
          isHigh
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
        }`}>
          {pct}%
        </div>
      </div>
      <p className="text-slate-500 line-clamp-3 leading-relaxed italic border-l-2 border-slate-200 pl-2.5">
        {source.chunk_text}
      </p>
    </div>
  )
}
