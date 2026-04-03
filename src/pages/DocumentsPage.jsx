import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { documentsApi } from '../api'
import FileUploader from '../components/FileUploader'
import { useAuth } from '../hooks/useAuth'

const TYPE_ICON = { pdf: '📕', md: '📝', txt: '📄' }
const TYPE_COLOR = {
  pdf: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  md: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  txt: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
}

export default function DocumentsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const load = useCallback(async () => {
        try {
          const { data } = await documentsApi.list()
          // Backend returns { items: [...], total, page, limit }
          setDocs(Array.isArray(data) ? data : (data.items ?? []))
        } finally {
          setLoading(false)
        }
      }, [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!confirm(t('documents.delete') + '?')) return
    await documentsApi.delete(id)
    load()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-7">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary-800">{t('documents.title')}</h1>
        <p className="text-sm text-slate-400 mt-1">
          Архивные документы, использованные для обучения ИИ-архивариуса
        </p>
      </div>

      {user && (
        <div className="card p-5">
          <p className="field-label mb-3">Загрузить документ</p>
          <FileUploader onUploaded={load} />
        </div>
      )}

      {/* Document list */}
      <div>
        <p className="field-label mb-3">Загруженные документы</p>
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse flex gap-3">
                  <div className="w-8 h-8 skeleton rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 skeleton w-1/2 rounded" />
                    <div className="h-3 skeleton w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="card p-14 text-center">
              <p className="text-3xl mb-3 opacity-40">🗂</p>
              <p className="font-serif text-slate-500">{t('documents.empty')}</p>
              <p className="text-xs text-slate-400 mt-1">Загрузите первый документ выше</p>
            </div>
          ) : (
            docs.map(doc => (
              <div key={doc.id} className="card-hover p-4 flex items-center gap-4 animate-fade-in">
                <div className="text-2xl shrink-0">
                  {TYPE_ICON[doc.file_type] || '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">{doc.filename}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t('documents.uploadedAt')}: {new Date(doc.uploaded_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${TYPE_COLOR[doc.file_type] || 'bg-slate-100 text-slate-500'}`}>
                  {doc.file_type}
                </span>
                {user?.role !== 'user' && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
                    title={t('documents.delete')}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
