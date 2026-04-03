import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { chatApi } from '../api'
import SourceCard from '../components/SourceCard'
import { useAuth } from '../hooks/useAuth'

export default function ChatPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef(null)
  const esRef = useRef(null)

  // Create or load session on mount
  useEffect(() => {
    chatApi.createSession()
      .then(({ data }) => setSessionId(data.id))
      .catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const newSession = async () => {
    esRef.current?.close()
    const { data } = await chatApi.createSession()
    setSessionId(data.id)
    setMessages([])
  }

  const sendMessage = async () => {
    if (!input.trim() || streaming || !sessionId) return
    const question = input.trim()
    setInput('')
    setStreaming(true)

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: question }])
    // Placeholder for assistant response
    setMessages(prev => [...prev, { role: 'assistant', content: '', sources: null, _streaming: true }])

    try {
      const token = localStorage.getItem('access_token')
      const url = `/api/chat/sessions/${sessionId}/message`

      // Send via fetch POST, stream response
      const res = await fetch(url, {
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
        buffer = lines.pop() // keep incomplete line

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
            }
          } catch { /* ignore parse errors */ }
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
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-stone-800">{t('chat.title')}</h1>
        <button onClick={newSession} className="btn-outline !text-xs">
          + {t('chat.newSession')}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <p className="text-4xl mb-3">🗂</p>
            <p className="text-sm">{t('chat.empty')}</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-500 text-white rounded-tr-sm'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm shadow-sm'
              }`}>
                {msg.content || (msg._streaming && (
                  <span className="text-stone-400 italic">{t('chat.thinking')}</span>
                ))}
                {msg._streaming && msg.content && <span className="typing-cursor" />}
              </div>

              {/* Sources */}
              {msg.role === 'assistant' && msg.sources?.length > 0 && (
                <div className="w-full">
                  <p className="text-xs font-medium text-stone-500 mb-1">{t('chat.sources')}</p>
                  <div className="grid gap-2">
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
      <div className="border-t border-stone-200 pt-4">
        <div className="flex gap-2">
          <textarea
            className="input flex-1 resize-none !py-2.5"
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
            className="btn-primary self-end"
          >
            {streaming ? '⏳' : '↑'}
          </button>
        </div>
        <p className="text-xs text-stone-400 mt-1">Enter — отправить · Shift+Enter — новая строка</p>
      </div>
    </div>
  )
}
