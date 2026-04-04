import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function DuplicateWarning({ persons, documents, mode = 'person', onConfirm, onCancel }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = mode === 'document' ? documents : persons

  const handleDocClick = (id) => {
    onCancel()
    navigate(`/documents?view=${id}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/60 backdrop-blur-sm p-4">
      <div className="card max-w-lg w-full p-7 shadow-card-lg animate-slide-up">
        <div className="mb-5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 ring-1 ring-amber-200 flex items-center justify-center text-sm">⚠</div>
            <h2 className="font-serif text-xl font-semibold text-slate-800">
              {mode === 'document' ? t('duplicate.docTitle') : t('duplicate.title')}
            </h2>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            {mode === 'document'
              ? t('duplicate.docSub')
              : t('duplicate.subtitle')}
          </p>
        </div>

        <div className="divider-navy mb-4" />

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {items.map(item => (
            <div
              key={item.id}
              onClick={mode === 'document' ? () => handleDocClick(item.id) : undefined}
              className={`flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border transition-all ${
                mode === 'document'
                  ? 'cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-sm'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex-1 min-w-0">
                {mode === 'document' ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">📄</span>
                    <p className="font-medium text-sm text-slate-800 truncate">{item.filename}</p>
                    <span className="text-[10px] text-indigo-400 shrink-0">{t('duplicate.open')}</span>
                  </div>
                ) : (
                  <>
                    <p className="font-serif font-semibold text-sm text-slate-800">{item.full_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.birth_year && `${item.birth_year} · `}{item.region}
                    </p>
                  </>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('duplicate.match')}</p>
                <p className={`text-sm font-bold ${item.similarity_score > 0.8 ? 'text-red-600' : 'text-amber-600'}`}>
                  {Math.round(item.similarity_score * 100)}%
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="btn-outline flex-1">{t('duplicate.cancel')}</button>
          <button onClick={onConfirm} className="btn-primary flex-1 justify-center">{t('duplicate.confirm')}</button>
        </div>
      </div>
    </div>
  )
}