import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { documentsApi } from '../api'
import FileUploader from '../components/FileUploader'
import { useAuth } from '../hooks/useAuth'

export default function DocumentsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data } = await documentsApi.list()
      setDocs(data)
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

  const TYPE_ICON = { pdf: '📕', md: '📝', txt: '📄' }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">{t('documents.title')}</h1>

      {user && <FileUploader onUploaded={load} />}

      <div className="space-y-2">
        {loading ? (
          <p className="text-center text-stone-400 py-8">{t('common.loading')}</p>
        ) : docs.length === 0 ? (
          <div className="card p-12 text-center text-stone-400">
            <p className="text-3xl mb-2">📭</p>
            <p>{t('documents.empty')}</p>
          </div>
        ) : docs.map(doc => (
          <div key={doc.id} className="card p-4 flex items-center gap-3">
            <span className="text-2xl">{TYPE_ICON[doc.file_type] || '📄'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-stone-800 truncate">{doc.filename}</p>
              <p className="text-xs text-stone-400">
                {t('documents.uploadedAt')}: {new Date(doc.uploaded_at).toLocaleDateString()}
              </p>
            </div>
            <span className="text-xs text-stone-400 uppercase">{doc.file_type}</span>
            {user?.role !== 'user' && (
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-red-400 hover:text-red-600 text-sm ml-2"
              >
                🗑
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
