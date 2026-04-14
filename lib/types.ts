export type Category = 'idea' | 'libro' | 'evento' | 'proyecto' | 'personal'
export type View = 'dashboard' | 'ideas' | 'libro' | 'calendario' | 'agente'

export interface Item {
  id: string
  title: string
  content: string
  category: Category
  createdAt: string
  updatedAt: string
  date?: string        // ISO date string, used for eventos
  chapter?: string     // chapter name/number for libro
  tags?: string[]
  pinned?: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  thinking?: string
}

export interface StoreState {
  items: Item[]
  messages: ChatMessage[]
  activeView: View
  selectedDate: string | null
  modalOpen: boolean
  modalCategory: Category | null
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateItem: (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>) => void
  deleteItem: (id: string) => void
  togglePin: (id: string) => void
  setActiveView: (view: View) => void
  setSelectedDate: (date: string | null) => void
  openModal: (category?: Category) => void
  closeModal: () => void
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string
  updateLastMessage: (content: string, thinking?: string) => void
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
    color: 'yellow',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/20',
    dot: 'bg-yellow-400',
    sidebar: 'hover:bg-yellow-500/10',
    gradient: 'from-yellow-500/20 to-yellow-600/5',
  },
  libro: {
    label: 'Libro',
    emoji: '📖',
    color: 'blue',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
    sidebar: 'hover:bg-blue-500/10',
    gradient: 'from-blue-500/20 to-blue-600/5',
  },
  evento: {
    label: 'Evento',
    emoji: '📅',
    color: 'green',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
    sidebar: 'hover:bg-emerald-500/10',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
  },
  proyecto: {
    label: 'Proyecto',
    emoji: '🚀',
    color: 'purple',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    border: 'border-violet-500/20',
    dot: 'bg-violet-400',
    sidebar: 'hover:bg-violet-500/10',
    gradient: 'from-violet-500/20 to-violet-600/5',
  },
  personal: {
    label: 'Personal',
    emoji: '🌿',
    color: 'rose',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    dot: 'bg-rose-400',
    sidebar: 'hover:bg-rose-500/10',
    gradient: 'from-rose-500/20 to-rose-600/5',
  },
}
