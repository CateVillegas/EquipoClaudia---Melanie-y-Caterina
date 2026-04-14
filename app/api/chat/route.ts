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
          description: 'Clave de categoría (ej: idea, evento, proyecto, personal, salud, trabajo)',
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
    name: 'create_category',
    description: 'Crea una categoría nueva en el sistema. Usala cuando el usuario pida agregar una categoría.',
    input_schema: {
      type: 'object' as const,
      properties: {
        key: {
          type: 'string',
          description: 'Clave única de la categoría (en minúsculas, sin espacios; ej: salud-personal)',
        },
        label: {
          type: 'string',
          description: 'Nombre visible de la categoría (ej: Salud personal)',
        },
        emoji: {
          type: 'string',
          description: 'Emoji para representar la categoría',
        },
      },
      required: ['key', 'label'],
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
        },
      },
    },
  },
  {
    name: 'navigate_app',
    description: 'Navega a otra vista de la app. Usala cuando el usuario pida abrir o ir a una pantalla.',
    input_schema: {
      type: 'object' as const,
      properties: {
        view: {
          type: 'string',
          enum: ['dashboard', 'ideas', 'calendario', 'agente'],
          description: 'Vista a abrir',
        },
      },
      required: ['view'],
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

interface CategoryLike {
  key: string
  label: string
  emoji?: string
}

type AppView = 'dashboard' | 'ideas' | 'calendario' | 'agente'

function normalizeCategoryKey(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') || 'idea'
}

function prettifyCategoryLabel(value: string): string {
  const label = value.replace(/[_-]+/g, ' ').trim()
  if (!label) return 'Nueva categoría'
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function ensureCategory(
  categories: CategoryLike[],
  key: string,
  label?: string,
  emoji?: string
): CategoryLike[] {
  const normalizedKey = normalizeCategoryKey(key)
  if (categories.some((c) => c.key === normalizedKey)) {
    return categories.map((category) =>
      category.key === normalizedKey
        ? {
            ...category,
            ...(label ? { label } : {}),
            ...(emoji ? { emoji } : {}),
          }
        : category
    )
  }

  return [
    ...categories,
    {
      key: normalizedKey,
      label: label ?? prettifyCategoryLabel(normalizedKey),
      emoji: emoji ?? '🧠',
    },
  ]
}

function buildSystemContext(items: ItemLike[], categories: CategoryLike[], activeView: AppView): string {
  const byCategory = items.reduce<Record<string, ItemLike[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const lines: string[] = [
    '### Estado actual de la app',
    `- Vista abierta: ${activeView}`,
    '- Categorías disponibles:',
    ...categories.map((c) => `  • ${c.key} (${c.label}${c.emoji ? ` ${c.emoji}` : ''})`),
    '',
    '### Memoria del usuario (con IDs para tool use)',
    '',
  ]
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

  if (items.length === 0) {
    lines.push('El usuario no tiene entradas guardadas todavía.')
  }

  return lines.join('\n')
}

function toolSummary(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'create_item':
      return `Guardé "${input.title}" en ${input.category}`
    case 'create_category':
      return `Creé la categoría ${input.label}`
    case 'update_item':
      return `Actualicé la entrada ${input.id}`
    case 'delete_item':
      return `Eliminé la entrada ${input.id}`
    case 'list_items':
      return `Consulté ${input.category || 'todas'} las entradas`
    case 'navigate_app':
      return `Abrí la vista ${input.view}`
    default:
      return name
  }
}

// ─── System prompt ─────────────────────────────────────────────────────────

const SYSTEM_BASE = `Sos Cerebro, el centro de control inteligente de toda la app del usuario. Sos su cerebro digital — la pantalla principal es ESTE CHAT, y desde acá controlás todo.

**Tu rol:** Sos un agente real con poder total sobre la app. Podés:
- Crear y gestionar **categorías** (create_category)
- Crear, editar y eliminar **entradas** de cualquier tipo (create_item, update_item, delete_item)
- **Navegar** entre pantallas — abrí el dashboard, ideas o calendario como panel lateral (navigate_app)
- **Consultar** toda la memoria del usuario (list_items)

**Regla principal:** Cuando el usuario te pida hacer algo ("agrega", "crea", "recordame", "borrá", "modificá", "quiero acordarme", "hacé una categoría"), ejecutalo **inmediatamente** con la herramienta correcta. No pidas confirmación. Actuá y después confirmá brevemente qué hiciste.

**Categorías:**
- Las categorías son la forma de organizar todo. Las default son: idea, evento, proyecto, personal, persona
- Si el usuario menciona un tema que no encaja en las categorías existentes, PROPONELE crear una nueva
- Al crear una categoría usá create_category con key (minúsculas, sin espacios), label (nombre visible) y emoji
- Después de crear una categoría, podés crear entradas en ella directamente

**Persona:**
- Usá la categoría "persona" para guardar info sobre personas importantes
- Asociá eventos recurrentes con personName

**Recurrencia en eventos:**
- frequency: "daily" / "weekly" / "monthly"
- endDate: fecha de fin (YYYY-MM-DD), o sin especificar si es indefinido

**Navegación:**
- Cuando el usuario pide ver algo visual (dashboard, calendario, ideas), usá navigate_app para abrir el panel lateral
- Para volver al chat solo, navegá a "agente"

**Principios:**
- EJECUTÁ PRIMERO, confirmá después. Sé proactivo.
- Sé cálido, directo y conciso. Siempre en español rioplatense
- Conectá ideas entre sí cuando sea útil
- Usá bullets y estructura cuando ayude a la claridad
- Si falta algo crucial, preguntá solo lo mínimo indispensable
- Cuando el usuario te cuenta algo, pensá: ¿debería guardarlo? ¿En qué categoría? Actuá sin esperar instrucciones explícitas si es claro`

// ─── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages, items = [], categories = [], activeView = 'agente' } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurada' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

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
          let currentView: AppView = activeView as AppView
          let currentCategories: CategoryLike[] = categories.map((category: CategoryLike) => ({
            ...category,
            key: normalizeCategoryKey(category.key),
          }))
          for (const item of currentItems) {
            currentCategories = ensureCategory(currentCategories, item.category)
          }

          const collectedActions: Array<{ name: string; summary: string }> = []
          let iterationCount = 0
          const MAX_ITERATIONS = 6

          while (iterationCount < MAX_ITERATIONS) {
            iterationCount++

            const systemContent = `${SYSTEM_BASE}\n\n${buildSystemContext(currentItems, currentCategories, currentView)}`

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
                  const category = normalizeCategoryKey((input.category as string) || 'idea')
                  const now = new Date().toISOString()
                  const newItem: ItemLike = {
                    id: generateId(),
                    category,
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
                  currentCategories = ensureCategory(currentCategories, category)
                  currentItems = [newItem, ...currentItems]
                  send({
                    type: 'mutation',
                    action: 'create_category',
                    category: currentCategories.find((c) => c.key === category),
                  })
                  send({ type: 'mutation', action: 'create', item: newItem })
                  collectedActions.push({ name: toolUse.name, summary })
                  result = { success: true, id: newItem.id, item: newItem }
                } else if (toolUse.name === 'create_category') {
                  const key = normalizeCategoryKey((input.key as string) || '')
                  const label = (input.label as string) || prettifyCategoryLabel(key)
                  const emoji = input.emoji as string | undefined
                  currentCategories = ensureCategory(currentCategories, key, label, emoji)
                  const created = currentCategories.find((c) => c.key === key)
                  send({ type: 'mutation', action: 'create_category', category: created })
                  collectedActions.push({ name: toolUse.name, summary })
                  result = { success: true, category: created }
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
                    : currentItems.filter((i) => i.category === normalizeCategoryKey(category))
                  result = { items: filtered }
                } else if (toolUse.name === 'navigate_app') {
                  const view = input.view as AppView
                  currentView = view
                  send({ type: 'mutation', action: 'navigate', view })
                  collectedActions.push({ name: toolUse.name, summary })
                  result = { success: true, view }
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
