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
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-stone-300 hover:border-primary-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">📄</div>
        <p className="text-stone-600 font-medium">
          {uploading ? t('documents.uploading') : t('documents.drop')}
        </p>
        <p className="text-xs text-stone-400 mt-1">{t('documents.types')}</p>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  )
}
