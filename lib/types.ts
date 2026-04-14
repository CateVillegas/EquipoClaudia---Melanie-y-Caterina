export type Category = string
export type View = 'dashboard' | 'ideas' | 'calendario' | 'agente'

export interface Recurrence {
  frequency: 'daily' | 'weekly' | 'monthly'
  endDate?: string // YYYY-MM-DD, undefined = sin fin
}

export interface Item {
  id: string
  title: string
  content: string
  category: Category
  chapter?: string
  createdAt: string
  updatedAt: string
  date?: string        // ISO date string, used for eventos
  tags?: string[]
  pinned?: boolean
  personName?: string  // nombre de la persona asociada (para categoria persona)
  recurrence?: Recurrence // para eventos recurrentes
}

export interface CategoryDefinition {
  key: string
  label: string
  emoji: string
}

export interface ToolAction {
  name: string
  summary: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  thinking?: string
  actions?: ToolAction[] // tool calls ejecutados en este mensaje
}

export interface StoreState {
  items: Item[]
  categories: CategoryDefinition[]
  messages: ChatMessage[]
  activeView: View
  selectedDate: string | null
  modalOpen: boolean
  modalCategory: Category | null
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void
  addItemDirect: (item: Item) => void
  updateItem: (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>) => void
  deleteItem: (id: string) => void
  togglePin: (id: string) => void
  upsertCategory: (category: CategoryDefinition) => void
  setActiveView: (view: View) => void
  setSelectedDate: (date: string | null) => void
  openModal: (category?: Category) => void
  closeModal: () => void
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string
  updateLastMessage: (content: string, thinking?: string, actions?: ToolAction[]) => void
  clearMessages: () => void
}

export interface CategoryConfig {
  label: string
  emoji: string
  color: string
  bg: string
  text: string
  border: string
  dot: string
  sidebar: string
  gradient: string
}

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { key: 'idea', label: 'Idea', emoji: '💡' },
  { key: 'evento', label: 'Evento', emoji: '📅' },
  { key: 'proyecto', label: 'Proyecto', emoji: '🚀' },
  { key: 'personal', label: 'Personal', emoji: '🌿' },
  { key: 'persona', label: 'Persona', emoji: '👤' },
]

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  idea: {
    label: 'Idea',
    emoji: '💡',
    color: 'amber',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    sidebar: 'hover:bg-amber-50',
    gradient: 'from-amber-50 to-white',
  },
  evento: {
    label: 'Evento',
    emoji: '📅',
    color: 'emerald',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    sidebar: 'hover:bg-emerald-50',
    gradient: 'from-emerald-50 to-white',
  },
  proyecto: {
    label: 'Proyecto',
    emoji: '🚀',
    color: 'violet',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
    sidebar: 'hover:bg-violet-50',
    gradient: 'from-violet-50 to-white',
  },
  personal: {
    label: 'Personal',
    emoji: '🌿',
    color: 'rose',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    sidebar: 'hover:bg-rose-50',
    gradient: 'from-rose-50 to-white',
  },
  persona: {
    label: 'Persona',
    emoji: '👤',
    color: 'sky',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
    sidebar: 'hover:bg-sky-50',
    gradient: 'from-sky-50 to-white',
  },
}

const FALLBACK_THEMES: CategoryConfig[] = [
  {
    label: 'Entrada',
    emoji: '🧠',
    color: 'cyan',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
    sidebar: 'hover:bg-cyan-50',
    gradient: 'from-cyan-50 to-white',
  },
  {
    label: 'Entrada',
    emoji: '🗂️',
    color: 'orange',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    sidebar: 'hover:bg-orange-50',
    gradient: 'from-orange-50 to-white',
  },
  {
    label: 'Entrada',
    emoji: '📝',
    color: 'teal',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    dot: 'bg-teal-500',
    sidebar: 'hover:bg-teal-50',
    gradient: 'from-teal-50 to-white',
  },
  {
    label: 'Entrada',
    emoji: '⭐',
    color: 'lime',
    bg: 'bg-lime-50',
    text: 'text-lime-700',
    border: 'border-lime-200',
    dot: 'bg-lime-500',
    sidebar: 'hover:bg-lime-50',
    gradient: 'from-lime-50 to-white',
  },
]

function prettifyCategoryLabel(category: string): string {
  const normalized = category.replace(/[_-]+/g, ' ').trim()
  if (!normalized) return 'Entrada'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function pickTheme(category: string): CategoryConfig {
  const hash = category
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return FALLBACK_THEMES[hash % FALLBACK_THEMES.length]
}

export function toCategoryKey(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') || 'idea'
}

export function getCategoryDefinition(
  category: Category,
  categories: CategoryDefinition[] = DEFAULT_CATEGORIES
): CategoryDefinition {
  const match = categories.find((c) => c.key === category)
  if (match) return match
  return {
    key: category,
    label: prettifyCategoryLabel(category),
    emoji: pickTheme(category).emoji,
  }
}

export function getCategoryConfig(
  category: Category,
  categories: CategoryDefinition[] = DEFAULT_CATEGORIES
): CategoryConfig {
  const staticCfg = CATEGORY_CONFIG[category]
  const def = getCategoryDefinition(category, categories)

  if (staticCfg) {
    return {
      ...staticCfg,
      label: def.label,
      emoji: def.emoji,
    }
  }

  const theme = pickTheme(category)
  return {
    ...theme,
    label: def.label,
    emoji: def.emoji,
  }
}
