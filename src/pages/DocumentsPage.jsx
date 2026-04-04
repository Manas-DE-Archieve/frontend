import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { documentsApi, factsApi } from '../api';
import FileUploader from '../components/FileUploader';
import { useAuth } from '../hooks/useAuth';
import Pagination from '../components/Pagination';
import DocumentViewerModal from '../components/DocumentViewerModal';

const PAGE_SIZE = 10;
const TYPE_ICON = { pdf: '📕', md: '📝', txt: '📄' };
const STATUS_CLASS = {
  pending: 'badge-pending',
  processing: 'badge-pending animate-pulse',
  processed: 'badge-verified',
  failed_extraction: 'badge-rejected',
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
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState('');

  const load = useCallback(async (p = 1, currentScope = 'all') => {
    setLoading(true);
    try {
      const params = { page: p, limit: PAGE_SIZE };
      if (currentScope === 'my') params.scope = 'my';
      const { data } = await documentsApi.list(params);
      setDocs(data.items ?? []);
      setTotal(data.total ?? 0);
      setPage(p);
    } catch (err) {
      if (err.response?.status === 401) setScope('all');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1, scope);
  }, [load, scope]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(t('documents.delete') + '?')) return;
    await documentsApi.delete(id);
    load(page, scope);
  };

  const handleViewDoc = async (id) => {
    setViewingDoc({ id }); 
    try {
      const { data } = await documentsApi.get(id);
      setViewingDoc(data);
    } catch (error) {
      console.error("Failed to fetch document content", error);
      setViewingDoc(null);
    }
  };

  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      handleViewDoc(viewId);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleUploaded = () => {
    if (scope === 'my') load(1, 'my');
    else setScope('my');
  };

  const handleGenerateFacts = async () => {
    setGenerating(true);
    setGenMsg('');
    try {
      await factsApi.generate();
      setGenMsg(t('documents.genStarted'));
    } catch {
      setGenMsg(t('documents.genError'));
    } finally {
      setGenerating(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      {viewingDoc && <DocumentViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary-800">{t('documents.title')}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {t('documents.subtitle')}
            </p>
          </div>
          {user && ['moderator', 'super_admin'].includes(user.role) && (
            <div className="shrink-0 text-right">
              <button onClick={handleGenerateFacts} disabled={generating} className="btn-outline !text-xs !py-2 !px-3 flex items-center gap-1.5">
                {generating ? <span className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" /> : '✨'}
                {t('documents.generateFacts')}
              </button>
              {genMsg && <p className="text-[11px] mt-1 text-slate-500">{genMsg}</p>}
            </div>
          )}
        </div>

        {user && (
          <div className="card p-5">
            <p className="field-label mb-3">{t('documents.uploadSection')}</p>
            <FileUploader onUploaded={handleUploaded} />
          </div>
        )}

        <div>
          <div className="flex border-b border-slate-200 mb-4">
            <button onClick={() => setScope('all')} className={`px-4 py-2 text-sm font-medium ${scope === 'all' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-slate-500'}`}>{t('documents.allDocs')}</button>
            {user && <button onClick={() => setScope('my')} className={`px-4 py-2 text-sm font-medium ${scope === 'my' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-slate-500'}`}>{t('documents.myDocs')}</button>}
          </div>

          <div className="space-y-2">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="card p-4 h-16 skeleton" />)
            ) : docs.length === 0 ? (
              <div className="card p-14 text-center">
                <p className="text-3xl mb-3 opacity-40">🗂</p>
                <p className="font-serif text-slate-500">{t('documents.empty')}</p>
              </div>
            ) : (
              docs.map(doc => {
                const statusKey = { pending: 'status.pending', processing: 'status.processing', processed: 'status.processed', failed_extraction: 'status.failedExtraction' }[doc.status];
                const statusClass = STATUS_CLASS[doc.status] || 'badge';
                return (
                  <div key={doc.id} onClick={() => handleViewDoc(doc.id)} className="card-hover p-4 flex items-center gap-4 cursor-pointer">
                    <div className="text-2xl shrink-0">{TYPE_ICON[doc.file_type] || '📄'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">{doc.filename}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`${statusClass} shrink-0`}>{statusKey ? t(statusKey) : doc.status}</span>
                    {user && (user.role !== 'user' || user.id === doc.uploaded_by) && (
                      <button onClick={(e) => handleDelete(e, doc.id)} className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50">✕</button>
                    )}
                  </div>
                )
              })
            )}
          </div>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => load(p, scope)} />}
        </div>
      </div>
    </>
  );
}