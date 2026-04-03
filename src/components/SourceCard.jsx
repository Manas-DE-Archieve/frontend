import { useTranslation } from 'react-i18next'

export default function SourceCard({ source }) {
  const { t } = useTranslation()
  const pct = Math.round((source.score ?? 0) * 100)

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="font-semibold text-stone-700 truncate">{source.document_name}</span>
        <span className={`shrink-0 font-bold ${pct > 75 ? 'text-green-600' : 'text-yellow-600'}`}>
          {pct}%
        </span>
      </div>
      <p className="text-stone-500 line-clamp-3 leading-relaxed">{source.chunk_text}</p>
    </div>
  )
}
