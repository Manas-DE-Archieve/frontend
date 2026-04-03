import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { documentsApi } from '../api'
import DuplicateWarning from './DuplicateWarning'

export default function FileUploader({ onUploaded }) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  // duplicateState: { files: File[], similar: SimilarDocument[] } | null
  const [duplicateState, setDuplicateState] = useState(null)

  const performUpload = useCallback(async (files) => {
    setUploading(true)
    setError('')
    const results = await Promise.allSettled(files.map(f => documentsApi.upload(f)))
    const failed = results.filter(r => r.status === 'rejected')
    const succeeded = results.filter(r => r.status === 'fulfilled')
    if (failed.length > 0) {
      setError(
        failed.map(f => f.reason.response?.data?.detail || t('common.error')).join('\n')
      )
    }
    if (succeeded.length > 0) onUploaded?.()
    setUploading(false)
  }, [onUploaded, t])

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return
    setError('')

    // Check each file for duplicates before uploading
    for (const file of acceptedFiles) {
      try {
        const res = await documentsApi.checkDuplicates(file)
        if (res.data.duplicates_found) {
          // Pause and ask user — attach all pending files to state
          setDuplicateState({ files: acceptedFiles, similar: res.data.similar_documents })
          return
        }
      } catch {
        // If check fails (e.g. 401), just proceed with upload
      }
    }

    await performUpload(acceptedFiles)
  }, [performUpload])

  const handleConfirm = useCallback(async () => {
    const files = duplicateState?.files || []
    setDuplicateState(null)
    await performUpload(files)
  }, [duplicateState, performUpload])

  const handleCancel = useCallback(() => {
    setDuplicateState(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'], 'text/markdown': ['.md'], 'application/pdf': ['.pdf'] },
    disabled: uploading,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-primary-400 bg-primary-50/50 shadow-navy scale-[1.01]'
            : 'border-slate-300 hover:border-primary-300 hover:bg-slate-50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3 transition-transform duration-200 select-none">
          {isDragActive ? '📂' : '📄'}
        </div>
        <p className="font-medium text-slate-600">
          {uploading ? t('documents.uploading') : isDragActive ? 'Отпустите файлы...' : t('documents.drop')}
        </p>
        <p className="text-xs text-slate-400 mt-1.5">{t('documents.types')}</p>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <pre className="mt-2.5 text-sm text-red-600 whitespace-pre-wrap font-sans bg-red-50 p-2 rounded-md">
          {error}
        </pre>
      )}

      {duplicateState && (
        <DuplicateWarning
          mode="document"
          documents={duplicateState.similar}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}