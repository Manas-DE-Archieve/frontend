import { useTranslation } from 'react-i18next'

export default function DuplicateWarning({ persons, onConfirm, onCancel }) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card max-w-lg w-full p-6 shadow-xl">
        <h2 className="text-lg font-bold text-stone-800 mb-1">{t('duplicate.title')}</h2>
        <p className="text-sm text-stone-500 mb-4">{t('duplicate.subtitle')}</p>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {persons.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-stone-800">{p.full_name}</p>
                <p className="text-xs text-stone-500">
                  {p.birth_year && `${p.birth_year} · `}{p.region}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-stone-500">{t('duplicate.match')}</span>
                <p className={`text-sm font-bold ${
                  p.similarity_score > 0.8 ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {Math.round(p.similarity_score * 100)}%
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="btn-outline flex-1">{t('duplicate.cancel')}</button>
          <button onClick={onConfirm} className="btn-primary flex-1">{t('duplicate.confirm')}</button>
        </div>
      </div>
    </div>
  )
}
