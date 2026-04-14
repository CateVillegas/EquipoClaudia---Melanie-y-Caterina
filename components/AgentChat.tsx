'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { ChatMessage, Item, ToolAction } from '@/lib/types'
import { cn, formatTime } from '@/lib/utils'
import {
  Brain,
  Send,
  Trash2,
  User,
  Sparkles,
  MessageCircle,
  Star,
  Compass,
  Zap,
  Check,
  PlusCircle,
  LayoutDashboard,
} from 'lucide-react'

const QUICK_PROMPTS = [
  {
    icon: PlusCircle,
    label: 'Crear categoría nueva',
    text: 'Quiero crear una nueva categoría. Proponé un nombre y emoji que tenga sentido.',
  },
  {
    icon: Star,
    label: 'Guardar una idea',
    text: 'Tengo una idea que quiero guardar. Te la cuento y vos organizala.',
  },
  {
    icon: Compass,
    label: '¿Qué tengo pendiente?',
    text: 'Revisá todo lo que tengo guardado y decime qué debería priorizar hoy.',
  },
  {
    icon: LayoutDashboard,
    label: 'Mostrá el dashboard',
    text: 'Abrí el dashboard para que vea un resumen de todo.',
  },
]

const QUICK_PROMPTS_COMPACT = [
  {
    icon: PlusCircle,
    label: 'Nueva categoría',
    text: 'Quiero crear una nueva categoría. Proponé un nombre y emoji.',
  },
  {
    icon: Star,
    label: 'Guardar idea',
    text: 'Tengo una idea que quiero guardar.',
  },
]

export default function AgentChat({ compact = false }: { compact?: boolean }) {
  const {
    messages,
    addMessage,
    updateLastMessage,
    clearMessages,
    items,
    categories,
    activeView,
    addItemDirect,
    updateItem,
    deleteItem,
    upsertCategory,
    setActiveView,
  } = useStore()
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

    const history = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userText },
    ]

    setLoading(true)
    addMessage({ role: 'assistant', content: '' })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, items, categories, activeView }),
      })

      if (!res.ok || !res.body) throw new Error(`Error ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      const collectedActions: ToolAction[] = []

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
              updateLastMessage(fullText, undefined, collectedActions.length ? collectedActions : undefined)
            } else if (parsed.type === 'tool_call') {
              collectedActions.push({ name: parsed.name, summary: parsed.summary })
              updateLastMessage(fullText, undefined, [...collectedActions])
            } else if (parsed.type === 'actions') {
              updateLastMessage(fullText, undefined, parsed.actions)
            } else if (parsed.type === 'mutation') {
              if (parsed.action === 'create' && parsed.item) {
                addItemDirect(parsed.item as Item)
              } else if (parsed.action === 'update' && parsed.id && parsed.updates) {
                updateItem(parsed.id, parsed.updates)
              } else if (parsed.action === 'delete' && parsed.id) {
                deleteItem(parsed.id)
              } else if (parsed.action === 'create_category' && parsed.category) {
                upsertCategory(parsed.category)
              } else if (parsed.action === 'navigate' && parsed.view) {
                setActiveView(parsed.view)
              }
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
      updateLastMessage(`⚠️ No pude conectarme: ${msg}\n\nAsegurate de que ANTHROPIC_API_KEY esté configurada.`)
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

  const prompts = compact ? QUICK_PROMPTS_COMPACT : QUICK_PROMPTS

  return (
    <div className="flex h-full flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e9e3da] px-5 py-4 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 ring-1 ring-violet-200">
            <Brain className="h-4.5 w-4.5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[#1c1815]">Cerebro</h1>
            <p className="text-[10px] text-[#a09890]">
              {items.length} {items.length === 1 ? 'entrada' : 'entradas'} · {categories.length} categorías
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[#a09890] hover:bg-[#f4f1ec] hover:text-[#6b6259] transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {!compact && 'Limpiar'}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 bg-[#faf9f6]">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center px-4">
            {!compact && (
              <>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 ring-1 ring-violet-200">
                  <Brain className="h-7 w-7 text-violet-500" />
                </div>
                <h2 className="mb-1.5 text-lg font-semibold text-[#1c1815]">
                  Tu cerebro digital
                </h2>
                <p className="mb-1.5 max-w-sm text-sm text-[#6b6259] leading-relaxed">
                  Soy el centro de control de toda la app. Puedo crear categorías, guardar ideas, agendar eventos, organizar proyectos y navegar entre pantallas.
                </p>
                <p className="mb-6 max-w-sm text-xs text-[#a09890]">
                  Pedime lo que necesites — yo me encargo.
                </p>
              </>
            )}
            {compact && (
              <p className="mb-4 text-sm text-[#6b6259]">
                Pedime lo que necesites
              </p>
            )}
            <div className={cn(
              'grid gap-2 w-full',
              compact ? 'grid-cols-1 max-w-[280px]' : 'grid-cols-2 max-w-md'
            )}>
              {prompts.map(({ icon: Icon, label, text }) => (
                <button
                  key={label}
                  onClick={() => send(text)}
                  className="flex items-center gap-2.5 rounded-xl border border-[#e9e3da] bg-white p-3 text-left hover:border-violet-200 hover:bg-violet-50 transition-all shadow-sm"
                >
                  <Icon className="h-4 w-4 shrink-0 text-violet-500" />
                  <span className="text-xs text-[#6b6259]">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} compact={compact} />
            ))}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 ring-1 ring-violet-200">
                  <Brain className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white border border-[#e9e3da] px-4 py-3 shadow-sm">
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
      <div className="border-t border-[#e9e3da] p-3 bg-white">
        <div className="flex items-end gap-2.5 rounded-xl border border-[#e9e3da] bg-[#faf9f6] px-3 py-2.5 focus-within:border-violet-300 focus-within:ring-1 focus-within:ring-violet-100 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={compact ? 'Escribí acá…' : 'Decime qué necesitás… (Enter para enviar)'}
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-transparent text-sm text-[#1c1815] placeholder-[#bfb9b2] outline-none disabled:opacity-50"
            style={{ maxHeight: '200px' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className={cn(
              'shrink-0 flex h-8 w-8 items-center justify-center rounded-lg transition-all',
              input.trim() && !loading
                ? 'bg-[#6d5fd3] text-white hover:bg-[#5e50c4] shadow-sm'
                : 'bg-[#f4f1ec] text-[#bfb9b2] cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, compact = false }: { message: ChatMessage; compact?: boolean }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex items-start gap-2.5', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-[#e9e3da]' : 'bg-violet-100 ring-1 ring-violet-200'
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-[#8c8279]" />
        ) : (
          <Brain className="h-3.5 w-3.5 text-violet-500" />
        )}
      </div>

      <div className={cn(
        'flex flex-col gap-1.5',
        isUser ? 'items-end' : 'items-start',
        compact ? 'max-w-[85%]' : 'max-w-[78%]'
      )}>
        {/* Tool actions badge */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.actions.map((action, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10px] font-medium text-violet-700"
              >
                <Zap className="h-2.5 w-2.5" />
                {action.summary}
                <Check className="h-2.5 w-2.5 text-violet-500" />
              </span>
            ))}
          </div>
        )}

        {/* Message bubble */}
        {(message.content || isUser) && (
          <div
            className={cn(
              'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
              isUser
                ? 'rounded-tr-sm bg-[#6d5fd3] text-white shadow-sm'
                : 'rounded-tl-sm bg-white text-[#3d3630] border border-[#e9e3da] shadow-sm'
            )}
          >
            {message.content ? (
              <div className="prose-light whitespace-pre-wrap">
                {message.content}
                {!isUser && message.content.length < 20 && (
                  <span className="cursor-blink ml-0.5 inline-block h-4 w-0.5 bg-violet-500 align-middle" />
                )}
              </div>
            ) : (
              <span className={cn('italic', isUser ? 'text-white/60' : 'text-[#bfb9b2]')}>
                Escribiendo…
              </span>
            )}
            <p className={cn('mt-1 text-[10px]', isUser ? 'text-white/50' : 'text-[#bfb9b2]')}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
