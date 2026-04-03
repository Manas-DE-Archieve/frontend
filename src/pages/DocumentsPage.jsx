import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { documentsApi } from '../api';
import FileUploader from '../components/FileUploader';
import { useAuth } from '../hooks/useAuth';
import Pagination from '../components/Pagination';
import DocumentViewerModal from '../components/DocumentViewerModal';

const PAGE_SIZE = 10;
const TYPE_ICON = { pdf: '📕', md: '📝', txt: '📄' };
const STATUS_STYLES = {
  pending: { label: 'Ожидает', class: 'badge-pending' },
  processing: { label: 'В обработке', class: 'badge-pending animate-pulse' },
  processed: { label: 'Обработан', class: 'badge-verified' },
  failed_extraction: { label: 'Ошибка ИИ', class: 'badge-rejected' },
};

export default function DocumentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [scope, setScope] = useState('all');

  const load = useCallback(async (p = 1, currentScope) => {
    setLoading(true);
    try {
      const params = { page: p, limit: PAGE_SIZE };
      if (currentScope === 'my') {
        params.scope = 'my';
      }
      const { data } = await documentsApi.list(params);
      setDocs(data.items ?? []);
      setTotal(data.total);
      setPage(p);
    } catch (err) {
      if (err.response?.status === 401) {
        // If token expired while on 'my' tab, switch to 'all'
        setScope('all');
      }
    }
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1, scope);
  }, [load, scope]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm(t('documents.delete') + '?')) return;
    await documentsApi.delete(id);
    load(page, scope);
  };

  const handleViewDoc = async (id) => {
    setViewingDoc({ id }); // Show skeleton while loading
    try {
      const { data } = await documentsApi.get(id);
      setViewingDoc(data);
    } catch (error) {
      console.error("Failed to fetch document content", error);
      setViewingDoc(null);
    }
  };

  // Auto-open document if ?view=ID is in URL (after handleViewDoc is defined)
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      handleViewDoc(viewId);
      setSearchParams({}, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUploaded = () => {
    // After upload, switch to 'my' tab to see the new document
    if (scope === 'my') {
      load(1, 'my');
    } else {
      setScope('my');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const renderDocItem = (doc) => {
    const statusInfo = STATUS_STYLES[doc.status] || { label: doc.status, class: 'badge' };
    return (
      <div
        key={doc.id}
        onClick={() => handleViewDoc(doc.id)}
        className="card-hover p-4 flex items-center gap-4 animate-fade-in cursor-pointer"
      >
        <div className="text-2xl shrink-0">{TYPE_ICON[doc.file_type] || '📄'}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-slate-800 truncate">{doc.filename}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('documents.uploadedAt')}: {new Date(doc.uploaded_at).toLocaleDateString('ru-RU')}
          </p>
        </div>
        <span className={`${statusInfo.class} shrink-0`}>{statusInfo.label}</span>
        {user && (user.role !== 'user' || user.id === doc.uploaded_by) && (
          <button
            onClick={(e) => handleDelete(e, doc.id)}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
            title={t('documents.delete')}
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {viewingDoc && <DocumentViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-7">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary-800">{t('documents.title')}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Загружайте документы, и система автоматически создаст карточки репрессированных.
          </p>
        </div>
        {user && (
          <div className="card p-5">
            <p className="field-label mb-3">Загрузить документ</p>
            <FileUploader onUploaded={handleUploaded} />
          </div>
        )}
        <div>
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-4">
            <button
              onClick={() => setScope('all')}
              className={`px-4 py-2 text-sm font-medium ${scope === 'all' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Все документы
            </button>
            {user && (
              <button
                onClick={() => setScope('my')}
                className={`px-4 py-2 text-sm font-medium ${scope === 'my' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Мои документы
              </button>
            )}
          </div>

          <div className="space-y-2">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="card p-4 h-16 skeleton" />)
            ) : docs.length === 0 ? (
              <div className="card p-14 text-center">
                <p className="text-3xl mb-3 opacity-40">🗂</p>
                <p className="font-serif text-slate-500">{t('documents.empty')}</p>
                {scope === 'all' && <p className="text-xs text-slate-400 mt-1">Загрузите первый документ</p>}
              </div>
            ) : (
              docs.map(renderDocItem)
            )}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => load(p, scope)}
            />
          )}
        </div>
      </div>
    </>
  );
}