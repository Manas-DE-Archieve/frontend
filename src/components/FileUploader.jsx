import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { documentsApi } from '../api'

export default function FileUploader({ onUploaded }) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return
    setUploading(true)
    setError('')
    try {
      for (const file of acceptedFiles) {
        await documentsApi.upload(file)
      }
      onUploaded?.()
    } catch (e) {
      setError(e.response?.data?.detail || t('common.error'))
    } finally {
      setUploading(false)
    }
  }, [onUploaded, t])

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
        <p className="text-xs text-slate-400 mt-1.5">
          {t('documents.types')}
        </p>

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2.5 text-sm text-red-600 flex items-center gap-1.5">
          <span>⚠</span>{error}
        </p>
      )}
    </div>
  )
}
