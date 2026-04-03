import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { chatApi } from '../api'
import SourceCard from '../components/SourceCard'
import { useAuth } from '../hooks/useAuth'

export default function ChatPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [sessions, setSessions]     = useState([])
  const [sessionId, setSessionId]   = useState(null)
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [streaming, setStreaming]   = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const bottomRef   = useRef(null)
  const textareaRef = useRef(null)

  // Load sessions list
  const loadSessions = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await chatApi.listSessions({ page: 1, limit: 30 })
      setSessions(data.items || [])
    } catch { /* not logged in */ }
  }, [user])

  // Create or resume session on mount
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

  const loadSession = async (id) => {
    try {
      const { data } = await chatApi.getMessages(id)
      // data is array of {role, content, sources}
      setMessages(data.map(m => ({ role: m.role, content: m.content, sources: m.sources })))
      setSessionId(id)
      setHistoryOpen(false)
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
              setMessages(prev => {
                const next = [...prev]
                next[next.length - 1] = { ...next[next.length - 1], sources: payload.data }
                return next
              })
            } else if (payload.type === 'token') {
              setMessages(prev => {
                const next = [...prev]
                next[next.length - 1] = {
                  ...next[next.length - 1],
                  content: next[next.length - 1].content + payload.data,
                }
                return next
              })
            } else if (payload.type === 'done') {
              setMessages(prev => {
                const next = [...prev]
                next[next.length - 1] = { ...next[next.length - 1], _streaming: false }
                return next
              })
              await loadSessions()
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', content: `Ошибка: ${e.message}`, _streaming: false }
        return next
      })
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
    return d.toLocaleDateString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary-800">{t('chat.title')}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Ответы основаны на загруженных архивных документах</p>
        </div>
        <div className="flex items-center gap-2">
          {user && sessions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setHistoryOpen(v => !v)}
                className="btn-outline !text-xs !py-2 !px-3"
                title="История диалогов"
              >
                🕐 История
              </button>
              {historyOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-card-lg border border-slate-200 z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-100">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">Диалоги</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {sessions.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => loadSession(s.id)}
                        className={`w-full text-left px-3 py-2.5 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 ${
                          s.id === sessionId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                        }`}
                      >
                        <span className="font-medium truncate">Диалог {sessions.length - i}</span>
                        <span className="text-slate-400 shrink-0 text-[10px]">{fmtDate(s.created_at)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <button onClick={newSession} className="btn-outline !text-xs !py-2 !px-3.5">
            + {t('chat.newSession')}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-5 pb-4 pr-1" onClick={() => setHistoryOpen(false)}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary-800/10 flex items-center justify-center text-3xl mb-4">🗂</div>
            <p className="font-serif text-lg text-slate-500 mb-1">{t('chat.empty')}</p>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Задайте вопрос об архивных документах, репрессиях или конкретных людях
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            {msg.role === 'assistant' && (
              <div className="shrink-0 w-7 h-7 rounded-lg bg-primary-800 flex items-center justify-center text-primary-200 text-xs font-serif font-bold self-end mb-0.5">
                А
              </div>
            )}

            <div className={`max-w-[82%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-card'
              }`}>
                {msg.content || (msg._streaming && (
                  <span className="text-slate-400 italic text-xs">{t('chat.thinking')}</span>
                ))}
                {msg._streaming && msg.content && <span className="typing-cursor" />}
              </div>

              {/* Compact sources */}
              {msg.role === 'assistant' && msg.sources?.length > 0 && (
                <div className="w-full space-y-1.5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-0.5">
                    {t('chat.sources')}
                  </p>
                  <div className="space-y-1.5">
                    {msg.sources.map((s, j) => <SourceCard key={j} source={s} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex gap-2 items-end">
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
        <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Enter — отправить · Shift+Enter — новая строка</p>
      </div>
    </div>
  )
}