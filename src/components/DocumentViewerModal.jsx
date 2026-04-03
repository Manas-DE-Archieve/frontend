// frontend/src/components/DocumentViewerModal.jsx
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DocumentViewerModal({ doc, onClose }) {
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="card w-full max-w-3xl h-[85vh] flex flex-col shadow-card-lg animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl">📄</span>
                        <h3 className="font-serif font-semibold text-slate-800 truncate">{doc.filename}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                    {doc.file_type === 'md' ? (
                        <article className="prose prose-sm max-w-none prose-slate">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {doc.raw_text}
                            </ReactMarkdown>
                        </article>
                    ) : (
                        <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans">
                            {doc.raw_text}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}