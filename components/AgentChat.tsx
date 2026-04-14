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
} from 'lucide-react'

const QUICK_PROMPTS = [
  {
    icon: Sparkles,
    label: '¿Qué está en mi cabeza?',
    text: 'Mirá todo lo que tengo guardado y decime qué patrones ves, qué conexiones hay entre mis ideas y qué podría estar pasando por alto.',
  },
  {
    icon: Star,
    label: 'Desarrollá mi mejor idea',
    text: 'Analizá mis ideas y elegí la que tenga más potencial. Desarrollala con pros, contras y próximos pasos concretos.',
  },
  {
    icon: Compass,
    label: '¿Qué tengo pendiente?',
    text: 'Revisá mis proyectos y eventos. ¿Qué debería priorizar ahora? Dame un resumen claro de lo que está en movimiento.',
  },
  {
    icon: MessageCircle,
    label: 'Ayudame a pensar algo',
    text: 'Mirá mis notas personales y contame qué observás sobre mis intereses y patrones. ¿Qué temas aparecen seguido?',
  },
]

export default function AgentChat() {
  const { messages, addMessage, updateLastMessage, clearMessages, items, addItemDirect, updateItem, deleteItem } = useStore()
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
        body: JSON.stringify({ messages: history, items }),
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
              // Visual feedback: show tool being called
              collectedActions.push({ name: parsed.name, summary: parsed.summary })
              updateLastMessage(fullText, undefined, [...collectedActions])
            } else if (parsed.type === 'actions') {
              // Final actions list
              updateLastMessage(fullText, undefined, parsed.actions)
            } else if (parsed.type === 'mutation') {
              // Apply state change to store
              if (parsed.action === 'create' && parsed.item) {
                addItemDirect(parsed.item as Item)
              } else if (parsed.action === 'update' && parsed.id && parsed.updates) {
                updateItem(parsed.id, parsed.updates)
              } else if (parsed.action === 'delete' && parsed.id) {
                deleteItem(parsed.id)
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

  return (
    <div className="flex h-full flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e9e3da] px-6 py-5 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 ring-1 ring-violet-200">
            <Brain className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#1c1815]">Tu asistente personal</h1>
            <p className="text-xs text-[#a09890]">
              Puede leer y modificar tu memoria · {items.length} {items.length === 1 ? 'entrada' : 'entradas'}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[#a09890] hover:bg-[#f4f1ec] hover:text-[#6b6259] transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#faf9f6]">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 ring-1 ring-violet-200">
              <Brain className="h-8 w-8 text-violet-500" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-[#1c1815]">
              Hola, ¿en qué estás pensando?
            </h2>
            <p className="mb-2 max-w-sm text-sm text-[#6b6259] leading-relaxed">
              Soy tu segunda mente. Puedo recordar, organizar y actuar — si me pedís que guarde algo, lo guardo.
            </p>
            <p className="mb-8 max-w-sm text-sm text-[#a09890]">
              Probá: <em className="text-[#6b6259]">"Recordame darle medicamentos al abuelo todos los días hasta el 30 de junio"</em>
            </p>
            <div className="grid grid-cols-2 gap-2.5 w-full max-w-md">
              {QUICK_PROMPTS.map(({ icon: Icon, label, text }) => (
                <button
                  key={label}
                  onClick={() => send(text)}
                  className="flex items-start gap-2.5 rounded-xl border border-[#e9e3da] bg-white p-3.5 text-left hover:border-violet-200 hover:bg-violet-50 transition-all shadow-sm"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  <span className="text-xs text-[#6b6259]">{label}</span>
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
      <div className="border-t border-[#e9e3da] p-4 bg-white">
        <div className="flex items-end gap-3 rounded-xl border border-[#e9e3da] bg-[#faf9f6] px-4 py-3 focus-within:border-violet-300 focus-within:ring-1 focus-within:ring-violet-100 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Contame lo que tenés en mente… (Enter para enviar)"
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
        <p className="mt-2 text-center text-[10px] text-[#d4cfc9]">
          Tu asistente puede guardar y modificar entradas directamente.
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
          isUser ? 'bg-[#e9e3da]' : 'bg-violet-100 ring-1 ring-violet-200'
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-[#8c8279]" />
        ) : (
          <Brain className="h-3.5 w-3.5 text-violet-500" />
        )}
      </div>

      <div className={cn('flex flex-col gap-1.5 max-w-[78%]', isUser && 'items-end')}>
        {/* Tool actions badge */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.actions.map((action, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2.5 py-0.5 text-[11px] font-medium text-violet-700"
              >
                <Zap className="h-3 w-3" />
                {action.summary}
                <Check className="h-3 w-3 text-violet-500" />
              </span>
            ))}
          </div>
        )}

        {/* Message bubble */}
        {(message.content || isUser) && (
          <div
            className={cn(
              'rounded-2xl px-4 py-3 text-sm leading-relaxed',
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
            <p className={cn('mt-1.5 text-[10px]', isUser ? 'text-white/50' : 'text-[#bfb9b2]')}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
