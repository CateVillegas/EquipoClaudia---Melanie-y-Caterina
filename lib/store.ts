import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  StoreState,
  Item,
  ChatMessage,
  Category,
  CategoryDefinition,
  Language,
  DEFAULT_CATEGORIES,
  toCategoryKey,
} from './types'
import { generateId } from './utils'

const SAMPLE_ITEMS: Item[] = [
  {
    id: 'sample-1',
    title: 'App de meditación con IA',
    content: 'Crear una app que personalice sesiones de meditación basándose en el estado emocional del usuario detectado por voz.',
    category: 'idea',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['IA', 'bienestar', 'voz'],
    pinned: true,
  },
  {
    id: 'sample-4',
    title: 'Conferencia de Innovación Tech',
    content: 'Asistir a la conferencia anual de tecnología. Preparar pitch de 5 minutos sobre el proyecto.',
    category: 'evento',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'sample-5',
    title: 'Cerebro App v1.0',
    content: 'Lanzar la primera versión de Cerebro con funcionalidades core: ideas, eventos y agente IA.',
    category: 'proyecto',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['desarrollo', 'lanzamiento'],
    pinned: true,
  },
  {
    id: 'sample-6',
    title: 'Rutina matutina',
    content: 'Despertar a las 6am. Meditación 10 min → Diario → Ejercicio 30 min → Ducha fría → Lectura 20 min.',
    category: 'personal',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['hábitos', 'bienestar'],
  },
]

function prettifyLabel(value: string): string {
  const label = value.replace(/[_-]+/g, ' ').trim()
  if (!label) return 'Nueva categoría'
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function ensureCategoryInList(
  categories: CategoryDefinition[],
  categoryKey: string,
  label?: string,
  emoji?: string
): CategoryDefinition[] {
  const key = toCategoryKey(categoryKey)
  if (categories.some((c) => c.key === key)) {
    return categories.map((c) =>
      c.key === key
        ? {
            ...c,
            ...(label ? { label } : {}),
            ...(emoji ? { emoji } : {}),
          }
        : c
    )
  }

  return [
    ...categories,
    {
      key,
      label: label ?? prettifyLabel(key),
      emoji: emoji ?? '🧠',
    },
  ]
}

function normalizeItem(item: Item): Item {
  return {
    ...item,
    category: toCategoryKey(item.category),
  }
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      items: SAMPLE_ITEMS,
      categories: DEFAULT_CATEGORIES,
      messages: [],
      activeView: 'agente',
      selectedDate: null,
      modalOpen: false,
      modalCategory: null,
      language: 'es' as Language,
      setLanguage: (lang) => set({ language: lang }),

      addItem: (item) => {
        const now = new Date().toISOString()
        const normalizedCategory = toCategoryKey(item.category)
        const newItem: Item = {
          ...item,
          category: normalizedCategory,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          items: [newItem, ...state.items],
          categories: ensureCategoryInList(state.categories, normalizedCategory),
        }))
      },

      addItemDirect: (item) => {
        const normalized = normalizeItem(item)
        set((state) => ({
          items: [normalized, ...state.items.filter((i) => i.id !== normalized.id)],
          categories: ensureCategoryInList(state.categories, normalized.category),
        }))
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        }))
      },

      deleteItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
      },

      togglePin: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, pinned: !item.pinned } : item
          ),
        }))
      },

      upsertCategory: (category) => {
        set((state) => ({
          categories: ensureCategoryInList(
            state.categories,
            category.key,
            category.label,
            category.emoji
          ),
        }))
      },

      setActiveView: (view) => set({ activeView: view }),
      setSelectedDate: (date) => set({ selectedDate: date }),

      openModal: (category) =>
        set({ modalOpen: true, modalCategory: category ?? null }),
      closeModal: () => set({ modalOpen: false, modalCategory: null }),

      addMessage: (message) => {
        const id = generateId()
        const newMsg: ChatMessage = {
          ...message,
          id,
          timestamp: new Date().toISOString(),
        }
        set((state) => ({ messages: [...state.messages, newMsg] }))
        return id
      },

      updateLastMessage: (content, thinking, actions) => {
        set((state) => {
          const msgs = [...state.messages]
          if (msgs.length === 0) return state
          const last = msgs[msgs.length - 1]
          msgs[msgs.length - 1] = {
            ...last,
            content,
            ...(thinking !== undefined ? { thinking } : {}),
            ...(actions !== undefined ? { actions } : {}),
          }
          return { messages: msgs }
        })
      },

      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'cerebro-storage',
      version: 3,
      migrate: (persisted: unknown) => {
        const state = persisted as Partial<StoreState> & {
          items?: Array<Item & { category: string }>
          categories?: CategoryDefinition[]
        }

        const normalizedItems = (state.items ?? [])
          .filter((i) => i.category !== 'libro')
          .map((item) => normalizeItem(item as Item))

        const categoriesFromItems = normalizedItems.reduce<CategoryDefinition[]>(
          (acc, item) => ensureCategoryInList(acc, item.category),
          []
        )

        state.items = normalizedItems
        state.categories = DEFAULT_CATEGORIES.reduce<CategoryDefinition[]>(
          (acc, def) => ensureCategoryInList(acc, def.key, def.label, def.emoji),
          state.categories ?? categoriesFromItems
        )

        if ((state.activeView as string | undefined) === 'libro') {
          state.activeView = 'agente'
        }

        if (!state.activeView) {
          state.activeView = 'agente'
        }

        return state as StoreState
      },
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
    }
  )
)
