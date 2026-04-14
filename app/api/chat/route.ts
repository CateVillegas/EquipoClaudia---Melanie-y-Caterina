import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ─── Tool definitions ──────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'create_item',
    description: 'Crea una nueva entrada en la memoria del usuario. Úsala inmediatamente cuando el usuario pida agregar algo — una idea, evento, proyecto, nota personal o persona. No pidas confirmación, ejecutá y luego confirmá brevemente.',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          enum: ['idea', 'evento', 'proyecto', 'personal', 'persona'],
          description: 'Categoría de la entrada',
        },
        title: { type: 'string', description: 'Título corto y descriptivo' },
        content: { type: 'string', description: 'Contenido detallado' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Etiquetas opcionales' },
        date: { type: 'string', description: 'Fecha YYYY-MM-DD (solo para eventos)' },
        personName: { type: 'string', description: 'Nombre de la persona a la que pertenece este recuerdo (solo para categoría persona)' },
        recurrence: {
          type: 'object',
          description: 'Si el evento se repite. Solo para categoría evento.',
          properties: {
            frequency: {
              type: 'string',
              enum: ['daily', 'weekly', 'monthly'],
              description: 'Con qué frecuencia se repite',
            },
            endDate: {
              type: 'string',
              description: 'Fecha de fin YYYY-MM-DD. Si no se especifica, se repite indefinidamente.',
            },
          },
          required: ['frequency'],
        },
        pinned: { type: 'boolean', description: 'Si debe aparecer fijado' },
      },
      required: ['category', 'title', 'content'],
    },
  },
  {
    name: 'update_item',
    description: 'Modifica una entrada existente del usuario. Buscá el ID en el contexto.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'ID de la entrada a modificar' },
        title: { type: 'string' },
        content: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        date: { type: 'string' },
        pinned: { type: 'boolean' },
        recurrence: {
          type: 'object',
          properties: {
            frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
            endDate: { type: 'string' },
          },
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_item',
    description: 'Elimina una entrada de la memoria del usuario. Usá solo cuando el usuario pide explícitamente borrar algo.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'ID de la entrada a eliminar' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_items',
    description: 'Lista las entradas del usuario, opcionalmente filtradas por categoría. Útil para buscar un ID específico.',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          enum: ['idea', 'evento', 'proyecto', 'personal', 'persona', 'all'],
        },
      },
    },
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

interface ItemLike {
  id: string
  category: string
  title: string
  content: string
  date?: string
  tags?: string[]
  pinned?: boolean
  personName?: string
  recurrence?: { frequency: string; endDate?: string }
  createdAt?: string
  updatedAt?: string
}

function buildSystemContext(items: ItemLike[]): string {
  if (items.length === 0) return 'El usuario no tiene entradas guardadas todavía.'

  const byCategory = items.reduce<Record<string, ItemLike[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const lines: string[] = ['### Memoria del usuario (con IDs para tool use)\n']
  for (const [cat, catItems] of Object.entries(byCategory)) {
    lines.push(`**${cat.toUpperCase()}** (${catItems.length})`)
    catItems.forEach((item) => {
      const extras = []
      if (item.personName) extras.push(`persona: ${item.personName}`)
      if (item.date) extras.push(`fecha: ${item.date}`)
      if (item.recurrence) extras.push(`recurrencia: ${item.recurrence.frequency}${item.recurrence.endDate ? ` hasta ${item.recurrence.endDate}` : ''}`)
      if (item.tags?.length) extras.push(`tags: ${item.tags.join(', ')}`)
      const extrasStr = extras.length ? ` [${extras.join(' | ')}]` : ''
      lines.push(`  • [ID: ${item.id}] ${item.title}${extrasStr}: ${item.content.slice(0, 150)}${item.content.length > 150 ? '…' : ''}`)
    })
  }
  return lines.join('\n')
}

function toolSummary(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'create_item':
      return `Guardé "${input.title}" en ${input.category}`
    case 'update_item':
      return `Actualicé la entrada ${input.id}`
    case 'delete_item':
      return `Eliminé la entrada ${input.id}`
    case 'list_items':
      return `Consulté ${input.category || 'todas'} las entradas`
    default:
      return name
  }
}

// ─── System prompt ─────────────────────────────────────────────────────────

const SYSTEM_BASE = `Sos Cerebro, la segunda mente del usuario. Su asistente personal más íntimo — conocés sus ideas, proyectos, personas importantes y hábitos.

Tu superpoder: **PODÉS ACTUAR**. No solo sugerís — usás herramientas para crear, modificar y eliminar entradas directamente en la memoria del usuario.

**Regla principal:** Cuando el usuario te pida hacer algo ("agrega", "crea", "recordame", "borrá", "modificá", "quiero acordarme"), ejecutalo **inmediatamente** con la herramienta correcta, sin pedir confirmación excepto si hay ambigüedad genuina. Luego confirmás brevemente lo que hiciste.

**Categoría "persona":**
- Usala para guardar información sobre personas importantes (familiares, amigos, colegas)
- Asociá recordatorios o eventos recurrentes a ellas
- Ejemplo: "Medicamentos del abuelo" → categoria: evento, personName: "Abuelo", recurrence: { frequency: "daily", endDate: "2025-06-01" }

**Recurrencia en eventos:**
- frequency: "daily" / "weekly" / "monthly"
- endDate: fecha de fin (YYYY-MM-DD), o sin especificar si es indefinido
- Los eventos recurrentes aparecen automáticamente en el calendario

**Principios:**
- Ejecutá primero, después confirmá brevemente
- Sé cálido, directo y conciso. Siempre en español
- Conectá ideas entre sí cuando sea útil
- Usá bullets y estructura cuando ayude a la claridad
- Si falta algo crucial, preguntá solo lo mínimo indispensable`

// ─── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages, items = [] } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurada' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const systemContent = `${SYSTEM_BASE}\n\n${buildSystemContext(items)}`

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }

        try {
          // Build messages for Claude
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let currentMessages: any[] = messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          }))

          let currentItems: ItemLike[] = [...items]
          const collectedActions: Array<{ name: string; summary: string }> = []
          let iterationCount = 0
          const MAX_ITERATIONS = 6

          while (iterationCount < MAX_ITERATIONS) {
            iterationCount++

            const response = await client.messages.create({
              model: 'claude-opus-4-6',
              max_tokens: 4096,
              stream: false,
              tools: TOOLS,
              system: [
                {
                  type: 'text',
                  text: systemContent,
                  cache_control: { type: 'ephemeral' },
                },
              ],
              messages: currentMessages,
            })

            // Stream any text blocks
            for (const block of response.content) {
              if (block.type === 'text' && block.text) {
                // Send text in sentence-sized chunks for streaming feel
                const sentences = block.text.match(/[^.!?\n]+[.!?\n]?/g) ?? [block.text]
                for (const sentence of sentences) {
                  send({ type: 'text', text: sentence })
                }
              }
            }

            if (response.stop_reason === 'end_turn') {
              // Done — send collected actions if any
              if (collectedActions.length > 0) {
                send({ type: 'actions', actions: collectedActions })
              }
              break
            }

            if (response.stop_reason === 'tool_use') {
              const toolUseBlocks = response.content.filter(
                (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
              )

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const toolResults: any[] = []

              for (const toolUse of toolUseBlocks) {
                const input = toolUse.input as Record<string, unknown>
                const summary = toolSummary(toolUse.name, input)

                // Signal tool call to frontend
                send({ type: 'tool_call', name: toolUse.name, summary })

                let result: unknown

                // Execute tool
                if (toolUse.name === 'create_item') {
                  const now = new Date().toISOString()
                  const newItem: ItemLike = {
                    id: generateId(),
                    category: input.category as string,
                    title: input.title as string,
                    content: input.content as string,
                    tags: input.tags as string[] | undefined,
                    date: input.date as string | undefined,
                    personName: input.personName as string | undefined,
                    recurrence: input.recurrence as ItemLike['recurrence'] | undefined,
                    pinned: (input.pinned as boolean | undefined) ?? false,
                    createdAt: now,
                    updatedAt: now,
                  }
                  currentItems = [newItem, ...currentItems]
                  send({ type: 'mutation', action: 'create', item: newItem })
                  collectedActions.push({ name: toolUse.name, summary })
                  result = { success: true, id: newItem.id, item: newItem }
                } else if (toolUse.name === 'update_item') {
                  const id = input.id as string
                  const existing = currentItems.find((i) => i.id === id)
                  if (!existing) {
                    result = { error: `No encontré una entrada con ID ${id}` }
                  } else {
                    const { id: _id, ...updates } = input
                    void _id
                    const updatedItem = { ...existing, ...updates, updatedAt: new Date().toISOString() }
                    currentItems = currentItems.map((i) => (i.id === id ? updatedItem : i))
                    send({ type: 'mutation', action: 'update', id, updates: { ...updates, updatedAt: updatedItem.updatedAt } })
                    collectedActions.push({ name: toolUse.name, summary })
                    result = { success: true, item: updatedItem }
                  }
                } else if (toolUse.name === 'delete_item') {
                  const id = input.id as string
                  const exists = currentItems.find((i) => i.id === id)
                  if (!exists) {
                    result = { error: `No encontré una entrada con ID ${id}` }
                  } else {
                    currentItems = currentItems.filter((i) => i.id !== id)
                    send({ type: 'mutation', action: 'delete', id })
                    collectedActions.push({ name: toolUse.name, summary })
                    result = { success: true }
                  }
                } else if (toolUse.name === 'list_items') {
                  const category = input.category as string | undefined
                  const filtered = !category || category === 'all'
                    ? currentItems
                    : currentItems.filter((i) => i.category === category)
                  result = { items: filtered }
                } else {
                  result = { error: `Herramienta desconocida: ${toolUse.name}` }
                }

                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: toolUse.id,
                  content: JSON.stringify(result),
                })
              }

              // Continue the loop with tool results
              currentMessages = [
                ...currentMessages,
                { role: 'assistant', content: response.content },
                { role: 'user', content: toolResults },
              ]
            }
          }

          send({ type: 'done' })
          controller.close()
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error desconocido'
          send({ type: 'error', text: msg })
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
