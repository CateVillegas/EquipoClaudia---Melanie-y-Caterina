'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { ChatMessage } from '@/lib/types'
import { cn, formatTime } from '@/lib/utils'
import { Bot, Send, Trash2, User, Zap, Lightbulb, BookOpen, Rocket } from 'lucide-react'

const QUICK_PROMPTS = [
  { icon: Lightbulb, label: 'Desarrolla mi última idea', text: 'Analiza y desarrolla mi última idea registrada. Dame perspectivas, posibles problemas y próximos pasos concretos.' },
  { icon: BookOpen, label: 'Ayuda con el libro', text: 'Revisa el contenido de mi libro y sugiere cómo desarrollar el siguiente capítulo o mejorar la estructura narrativa.' },
  { icon: Rocket, label: 'Estado de proyectos', text: 'Analiza mis proyectos activos y dame un resumen del progreso, posibles obstáculos y acciones prioritarias.' },
  { icon: Zap, label: 'Conecta mis ideas', text: 'Mira todas mis entradas y encuentra conexiones interesantes entre ellas. ¿Qué patrones ves? ¿Qué oportunidades emergen?' },
]

function buildContext(items: ReturnType<typeof useStore>['items']): string {
  if (items.length === 0) return 'El usuario no tiene entradas guardadas aún.'

  const byCategory = items.reduce<Record<string, typeof items>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    },
    {}
  )

  const lines: string[] = []
  for (const [cat, catItems] of Object.entries(byCategory)) {
    lines.push(`\n## ${cat.toUpperCase()} (${catItems.length} entradas)`)
    catItems.slice(0, 5).forEach((item) => {
      lines.push(`- **${item.title}**: ${item.content.slice(0, 200)}${item.content.length > 200 ? '…' : ''}`)
    })
    if (catItems.length > 5) {
      lines.push(`  (...y ${catItems.length - 5} más)`)
    }
  }
  return lines.join('\n')
}

export default function AgentChat() {
  const { messages, addMessage, updateLastMessage, clearMessages, items } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text?: string) => {
    const userText = (text ?? input).trim()
    if (!userText || loading) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    addMessage({ role: 'user', content: userText })

    const context = buildContext(items)
    const history = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userText },
    ]

    setLoading(true)
    const assistantId = addMessage({ role: 'assistant', content: '' })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`Error ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'text') {
              fullText += parsed.text
              updateLastMessage(fullText)
            } else if (parsed.type === 'error') {
              fullText += `\n\n⚠️ Error: ${parsed.text}`
              updateLastMessage(fullText)
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      updateLastMessage(`⚠️ No se pudo conectar: ${msg}\n\nAsegúrate de que la variable ANTHROPIC_API_KEY esté configurada.`)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  return (
    <div className="flex h-full flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 ring-1 ring-violet-500/30">
            <Bot className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Agente Cerebro</h1>
            <p className="text-xs text-slate-500">
              Powered by Claude Opus 4.6 · {items.length} entradas como contexto
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/20 ring-1 ring-violet-500/20">
              <Bot className="h-8 w-8 text-violet-400" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-white">
              ¿En qué puedo ayudarte?
            </h2>
            <p className="mb-8 max-w-sm text-sm text-slate-500">
              Tengo acceso a todas tus ideas, proyectos y notas. Pregúntame cualquier cosa.
            </p>
            <div className="grid grid-cols-2 gap-2.5 w-full max-w-md">
              {QUICK_PROMPTS.map(({ icon: Icon, label, text }) => (
                <button
                  key={label}
                  onClick={() => send(text)}
                  className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-[#111118] p-3.5 text-left hover:border-violet-500/20 hover:bg-violet-500/5 transition-all"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                  <span className="text-xs text-slate-400">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/20">
                  <Bot className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-[#111118] px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-4">
        <div className="flex items-end gap-3 rounded-xl border border-white/5 bg-[#111118] px-4 py-3 focus-within:border-violet-500/30 focus-within:ring-1 focus-within:ring-violet-500/10 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje… (Enter para enviar, Shift+Enter para nueva línea)"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none disabled:opacity-50"
            style={{ maxHeight: '200px' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className={cn(
              'shrink-0 flex h-8 w-8 items-center justify-center rounded-lg transition-all',
              input.trim() && !loading
                ? 'bg-violet-600 text-white hover:bg-violet-500'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-700">
          Claude puede cometer errores. Verifica información importante.
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-slate-700'
            : 'bg-violet-600/20 ring-1 ring-violet-500/30'
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-violet-400" />
        )}
      </div>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'rounded-tr-sm bg-violet-600/20 text-slate-200'
            : 'rounded-tl-sm bg-[#111118] text-slate-300'
        )}
      >
        {message.content ? (
          <div className="prose-dark whitespace-pre-wrap">
            {message.content}
            {!isUser && message.content.length < 20 && (
              <span className="cursor-blink ml-0.5 inline-block h-4 w-0.5 bg-violet-400 align-middle" />
            )}
          </div>
        ) : (
          <span className="text-slate-600 italic">Escribiendo…</span>
        )}
        <p className="mt-1.5 text-[10px] text-slate-600">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}
