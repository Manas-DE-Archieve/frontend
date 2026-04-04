import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { chatApi } from '../api'
import SourceCard from '../components/SourceCard'
import { useAuth } from '../hooks/useAuth'

function SourcesToggle({ sources }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  if (!sources?.length) return null
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
      >
        <span className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>▶</span>
        {t('chat.sources')} ({sources.length})
      </button>
      {open && (
        <div className="mt-1.5 space-y-1.5">
          {sources.map((s, j) => <SourceCard key={j} source={s} />)}
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [sessions, setSessions]       = useState([])
  const [sessionId, setSessionId]     = useState(null)
  const [messages, setMessages]       = useState([])
  const [input, setInput]             = useState('')
  const [streaming, setStreaming]     = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // closed by default on mobile

  const bottomRef   = useRef(null)
  const textareaRef = useRef(null)

  const loadSessions = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await chatApi.listSessions({ page: 1, limit: 50 })
      setSessions(data.items || [])
    } catch {}
  }, [user])

  useEffect(() => {
    const init = async () => {
      await loadSessions()
      try {
        const { data } = await chatApi.createSession()
        setSessionId(data.id)
      } catch {}
    }
    init()
  }, [loadSessions])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Lock body when mobile sidebar open
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const openSession = async (id) => {
    try {
      const { data } = await chatApi.getMessages(id)
      setMessages(data.map(m => ({ role: m.role, content: m.content, sources: m.sources })))
      setSessionId(id)
      setSidebarOpen(false)
    } catch {}
  }

  const newSession = async () => {
    try {
      const { data } = await chatApi.createSession()
      setSessionId(data.id)
      setMessages([])
      setSidebarOpen(false)
      await loadSessions()
    } catch {}
  }

  const sendMessage = async () => {
    if (!input.trim() || streaming || !sessionId) return
    const question = input.trim()
    setInput('')
    setStreaming(true)

    setMessages(prev => [
      ...prev,
      { role: 'user', content: question },
      { role: 'assistant', content: '', sources: null, _streaming: true },
    ])

    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`/api/chat/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: question }),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const payload = JSON.parse(line.slice(6))
            if (payload.type === 'sources') {
              setMessages(prev => { const n=[...prev]; n[n.length-1]={...n[n.length-1],sources:payload.data}; return n })
            } else if (payload.type === 'token') {
              setMessages(prev => { const n=[...prev]; n[n.length-1]={...n[n.length-1],content:n[n.length-1].content+payload.data}; return n })
            } else if (payload.type === 'done') {
              setMessages(prev => { const n=[...prev]; n[n.length-1]={...n[n.length-1],_streaming:false}; return n })
              await loadSessions()
            }
          } catch {}
        }
      }
    } catch (e) {
      setMessages(prev => { const n=[...prev]; n[n.length-1]={role:'assistant',content:`${t('chat.error')}: ${e.message}`,_streaming:false}; return n })
    } finally {
      setStreaming(false)
      textareaRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const fmtDate = (iso) => {
    const d = new Date(iso)
    const today = new Date()
    if (d.toDateString() === today.toDateString())
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
  }

  const titledSessions = sessions.filter(s => s.title)

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden relative">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="drawer-backdrop md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full z-40
        w-72 md:w-64 shrink-0
        bg-slate-50 border-r border-slate-200
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0 drawer-panel shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar header */}
        <div className="p-3 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={newSession}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-primary-700 hover:bg-primary-800 text-white text-sm font-medium transition-colors"
          >
            ✏ {t('chat.newSession')}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {titledSessions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center mt-8 px-3">{t('chat.historyEmpty')}</p>
          ) : (
            titledSessions.map((s, i) => (
              <button
                key={s.id}
                onClick={() => openSession(s.id)}
                className={`group w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-white transition-colors rounded-xl mb-0.5 ${
                  s.id === sessionId ? 'bg-white shadow-sm' : ''
                }`}
              >
                <span className="text-slate-400 shrink-0 mt-0.5 text-base">💬</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs truncate font-medium leading-snug ${
                    s.id === sessionId ? 'text-primary-700' : 'text-slate-700'
                  }`}>
                    {s.title || `${t('chat.sessionFallback')} ${titledSessions.length - i}`}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(s.created_at)}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white shrink-0">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className={`p-2 rounded-lg transition-colors ${
              sidebarOpen
                ? 'bg-primary-100 text-primary-700'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={t('chat.historyTitle')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <rect y="2" width="18" height="2" rx="1"/>
              <rect y="8" width="12" height="2" rx="1"/>
              <rect y="14" width="15" height="2" rx="1"/>
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-lg font-bold text-primary-800 leading-none">
              {t('chat.title')}
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
              {t('chat.subtitle')}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-16 page-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-primary-800/10 flex items-center justify-center text-3xl mb-4">🗂</div>
              <p className="font-serif text-lg text-slate-500 mb-1">{t('chat.empty')}</p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {t('chat.emptySubtext')}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="shrink-0 w-7 h-7 rounded-lg bg-primary-800 flex items-center justify-center text-primary-200 text-xs font-serif font-bold self-end mb-0.5">А</div>
              )}
              <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.content || (msg._streaming && (
                    <span className="text-slate-400 italic text-xs">{t('chat.thinking')}</span>
                  ))}
                  {msg._streaming && msg.content && <span className="typing-cursor" />}
                </div>
                {msg.role === 'assistant' && <SourcesToggle sources={msg.sources} />}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 bg-white px-4 py-3 shrink-0">
          <div className="flex gap-2 items-end max-w-3xl mx-auto">
            <textarea
              ref={textareaRef}
              className="input flex-1 resize-none !py-2.5 !leading-relaxed text-sm"
              rows={2}
              placeholder={t('chat.placeholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={streaming}
            />
            <button
              onClick={sendMessage}
              disabled={streaming || !input.trim() || !sessionId}
              className="btn-primary self-end !px-3.5 !py-2.5 shrink-0"
            >
              {streaming
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                : '↑'}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 max-w-3xl mx-auto">
            {t('chat.hint')}
          </p>
        </div>
      </div>
    </div>
  )
}