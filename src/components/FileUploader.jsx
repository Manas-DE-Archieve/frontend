import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { documentsApi } from '../api'
import DuplicateWarning from './DuplicateWarning'

export default function FileUploader({ onUploaded, disabled, onDisabledClick }) {
  const { t } = useTranslation()
  const [phase, setPhase] = useState(null) // null | 'checking' | 'uploading'
  const [droppedFiles, setDroppedFiles] = useState([])
  const [error, setError] = useState('')
  const [duplicateState, setDuplicateState] = useState(null)

  const busy = phase !== null

  const performUpload = useCallback(async (files, force = false) => {
    setPhase('uploading')
    setError('')
    const results = await Promise.allSettled(files.map(f => documentsApi.upload(f, force)))

    const hardFailed = results.filter(r =>
      r.status === 'rejected' && r.reason?.response?.status !== 409
    )
    const alreadyExists = results.filter(r =>
      r.status === 'rejected' && r.reason?.response?.status === 409
    )
    const succeeded = results.filter(r => r.status === 'fulfilled')

    if (hardFailed.length > 0) {
      const msg = hardFailed
        .map(f => f.reason?.response?.data?.detail || f.reason?.message || 'Ошибка загрузки')
        .join('\n')
      setError(msg)
    }
    if (alreadyExists.length > 0) {
      setError(
        alreadyExists
          .map(f => f.reason?.response?.data?.detail || 'Документ уже существует в архиве.')
          .join('\n')
      )
    }
    if (succeeded.length > 0) onUploaded?.()
    setDroppedFiles([])
    setPhase(null)
  }, [onUploaded])

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return
    if (disabled) { onDisabledClick?.(); return }

    setError('')
    setDroppedFiles(acceptedFiles)
    setPhase('checking')

    for (const file of acceptedFiles) {
      try {
        const res = await documentsApi.checkDuplicates(file)
        if (res.data.duplicates_found) {
          setPhase(null)
          setDuplicateState({ files: acceptedFiles, similar: res.data.similar_documents })
          return
        }
      } catch {
        // proceed anyway
      }
    }

    await performUpload(acceptedFiles)
  }, [performUpload, disabled, onDisabledClick])

  const handleConfirm = useCallback(async () => {
    const files = duplicateState?.files || []
    setDuplicateState(null)
    await performUpload(files, true)  // force=true — user confirmed
  }, [duplicateState, performUpload])

  const handleCancel = useCallback(() => {
    setDuplicateState(null)
    setDroppedFiles([])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'], 'text/markdown': ['.md'], 'application/pdf': ['.pdf'] },
    disabled: busy,
  })

  const phaseLabel = {
    checking: 'Проверяем дубликаты...',
    uploading: 'Загружаем файл...',
  }

  return (
    <div>
      <div
        {...getRootProps()}
        onClick={disabled ? (e) => { e.stopPropagation(); onDisabledClick?.() } : getRootProps().onClick}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ${
          disabled
            ? 'border-slate-200 bg-slate-50 cursor-pointer opacity-60'
            : busy
            ? 'border-primary-300 bg-primary-50/30 cursor-wait'
            : isDragActive
            ? 'border-primary-400 bg-primary-50/50 scale-[1.01] cursor-copy'
            : 'border-slate-300 hover:border-primary-300 hover:bg-slate-50 cursor-pointer'
        }`}
      >
        <input {...getInputProps()} disabled={busy || disabled} />

        {busy ? (
          /* Single spinner state — replaces everything inside */
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-primary-600">{phaseLabel[phase]}</p>
            {droppedFiles.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                {droppedFiles.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs bg-primary-100 text-primary-700 rounded-full px-2.5 py-0.5">
                    📎 {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Idle state */
          <>
            <div className="text-4xl mb-3 select-none">{isDragActive ? '📂' : '📄'}</div>
            <p className="font-medium text-slate-600">
              {isDragActive ? 'Отпустите файлы...' : t('documents.drop')}
            </p>
            <p className="text-xs text-slate-400 mt-1.5">{t('documents.types')}</p>
          </>
        )}
      </div>

      {error && (
        <div className={`mt-2.5 text-sm rounded-lg p-3 whitespace-pre-wrap border ${
          error.includes('уже существует')
            ? 'text-amber-700 bg-amber-50 border-amber-200'
            : 'text-red-600 bg-red-50 border-red-100'
        }`}>
          {error.includes('уже существует') ? '⚠️ ' : '❌ '}{error}
        </div>
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