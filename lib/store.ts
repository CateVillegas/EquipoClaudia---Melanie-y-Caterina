import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { StoreState, Item, ChatMessage, Category } from './types'
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

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      items: SAMPLE_ITEMS,
      messages: [],
      activeView: 'dashboard',
      selectedDate: null,
      modalOpen: false,
      modalCategory: null,

      addItem: (item) => {
        const now = new Date().toISOString()
        const newItem: Item = {
          ...item,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ items: [newItem, ...state.items] }))
      },

      addItemDirect: (item) => {
        set((state) => ({
          items: [item, ...state.items.filter((i) => i.id !== item.id)],
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
      version: 2,
      migrate: (persisted: unknown) => {
        const state = persisted as Partial<StoreState> & { items?: Array<{ category: string }> }
        if (state.items) {
          state.items = state.items.filter((i) => i.category !== 'libro') as Item[]
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((state as any).activeView === 'libro') {
          state.activeView = 'dashboard'
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
