import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { chatApi } from '../api'
import SourceCard from '../components/SourceCard'
import { useAuth } from '../hooks/useAuth'

function SourcesToggle({ sources }) {
  const [open, setOpen] = useState(false)
  if (!sources?.length) return null

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
      >
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
        Источники ({sources.length})
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

  const [sessions, setSessions]   = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [streaming, setStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const bottomRef   = useRef(null)
  const textareaRef = useRef(null)

  const loadSessions = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await chatApi.listSessions({ page: 1, limit: 50 })
      // Only sessions with a title (i.e. at least one message)
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

  const openSession = async (id) => {
    try {
      const { data } = await chatApi.getMessages(id)
      setMessages(data.map(m => ({ role: m.role, content: m.content, sources: m.sources })))
      setSessionId(id)
    } catch {}
  }

  const newSession = async () => {
    try {
      const { data } = await chatApi.createSession()
      setSessionId(data.id)
      setMessages([])
      await loadSessions()
    } catch {}
  }

  const deleteSession = async (e, id) => {
    e.stopPropagation()
    // Just start fresh — no delete endpoint needed, just clear
    if (id === sessionId) {
      await newSession()
    }
    setSessions(s => s.filter(x => x.id !== id))
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
              setMessages(prev => { const n = [...prev]; n[n.length-1] = {...n[n.length-1], sources: payload.data}; return n })
            } else if (payload.type === 'token') {
              setMessages(prev => { const n = [...prev]; n[n.length-1] = {...n[n.length-1], content: n[n.length-1].content + payload.data}; return n })
            } else if (payload.type === 'done') {
              setMessages(prev => { const n = [...prev]; n[n.length-1] = {...n[n.length-1], _streaming: false}; return n })
              await loadSessions()
            }
          } catch {}
        }
      }
    } catch (e) {
      setMessages(prev => { const n = [...prev]; n[n.length-1] = {role:'assistant', content:`Ошибка: ${e.message}`, _streaming:false}; return n })
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
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
  }

  const titledSessions = sessions.filter(s => s.title)

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} shrink-0 transition-all duration-200 overflow-hidden border-r border-slate-200 bg-slate-50 flex flex-col`}>
        <div className="p-3 border-b border-slate-200">
          <button
            onClick={newSession}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary-700 hover:bg-primary-800 text-white text-sm font-medium transition-colors"
          >
            ✏ Новый диалог
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {titledSessions.length === 0 && (
            <p className="text-xs text-slate-400 text-center mt-6 px-4">История пуста</p>
          )}
          {titledSessions.map(s => (
            <button
              key={s.id}
              onClick={() => openSession(s.id)}
              className={`group w-full text-left px-3 py-2.5 flex items-start gap-2 hover:bg-white transition-colors rounded-lg mx-1 ${
                s.id === sessionId ? 'bg-white shadow-sm' : ''
              }`}
            >
              <span className="text-slate-400 shrink-0 mt-0.5">💬</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs truncate font-medium ${s.id === sessionId ? 'text-primary-700' : 'text-slate-700'}`}>
                  {s.title || 'Диалог'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(s.created_at)}</p>
              </div>
              <button
                onClick={(e) => deleteSession(e, s.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 text-xs shrink-0 transition-all"
                title="Удалить"
              >✕</button>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-white">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded"
            title="Показать/скрыть историю"
          >
            ☰
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-xl font-bold text-primary-800 leading-none">{t('chat.title')}</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Ответы основаны на загруженных архивных документах</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-16">
              <div className="w-16 h-16 rounded-2xl bg-primary-800/10 flex items-center justify-center text-3xl mb-4">🗂</div>
              <p className="font-serif text-lg text-slate-500 mb-1">{t('chat.empty')}</p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Задайте вопрос об архивных документах, репрессиях или конкретных людях
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="shrink-0 w-7 h-7 rounded-lg bg-primary-800 flex items-center justify-center text-primary-200 text-xs font-serif font-bold self-end mb-0.5">А</div>
              )}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.content || (msg._streaming && <span className="text-slate-400 italic text-xs">{t('chat.thinking')}</span>)}
                  {msg._streaming && msg.content && <span className="typing-cursor" />}
                </div>
                {msg.role === 'assistant' && <SourcesToggle sources={msg.sources} />}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 bg-white px-5 py-4">
          <div className="flex gap-2 items-end max-w-3xl mx-auto">
            <textarea
              ref={textareaRef}
              className="input flex-1 resize-none !py-3 !leading-relaxed"
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
              className="btn-primary self-end !px-4 !py-3 shrink-0"
            >
              {streaming
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                : '↑'}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 ml-1 max-w-3xl mx-auto">Enter — отправить · Shift+Enter — новая строка</p>
        </div>
      </div>
    </div>
  )
}