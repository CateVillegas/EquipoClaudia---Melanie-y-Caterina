export type Category = 'idea' | 'evento' | 'proyecto' | 'personal' | 'persona'
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
  createdAt: string
  updatedAt: string
  date?: string        // ISO date string, used for eventos
  tags?: string[]
  pinned?: boolean
  personName?: string  // nombre de la persona asociada (para categoria persona)
  recurrence?: Recurrence // para eventos recurrentes
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
