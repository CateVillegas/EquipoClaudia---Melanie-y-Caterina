'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import {
  Category,
  DEFAULT_CATEGORIES,
  getCategoryDefinition,
} from '@/lib/types'
import { cn } from '@/lib/utils'
import IdeaCard from './IdeaCard'
import Header from './Header'
import { Search } from 'lucide-react'

export default function IdeasView() {
  const { items, openModal, categories } = useStore()
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')

  const filterableCategories = [
    ...DEFAULT_CATEGORIES.map((c) => c.key),
    ...categories
      .map((c) => c.key)
      .filter((key) => !DEFAULT_CATEGORIES.some((base) => base.key === key))
      .sort((a, b) => a.localeCompare(b)),
  ].filter((key) => key !== 'evento')

  const filters: Array<{ value: Category | 'all'; label: string }> = [
    { value: 'all', label: 'Todas' },
    ...filterableCategories.map((key) => {
      const def = getCategoryDefinition(key, categories)
      return {
        value: key,
        label: `${def.emoji} ${def.label}`,
      }
    }),
  ]

  const filtered = items
    .filter((i) => {
      if (i.category === 'evento') return false
      if (filter === 'all') return true
      return i.category === filter
    })
    .filter((i) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        i.title.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q) ||
        i.tags?.some((t) => t.toLowerCase().includes(q))
      )
    })

  const pinned = filtered.filter((i) => i.pinned)
  const rest = filtered.filter((i) => !i.pinned)

  return (
    <div className="min-h-screen animate-fade-in">
      <Header
        title="Ideas & Proyectos"
        subtitle={`${filtered.length} ${filtered.length === 1 ? 'entrada' : 'entradas'}`}
        action={{ label: 'Nueva entrada', onClick: () => openModal() }}
      />

      {/* Filters + Search */}
      <div className="px-6 pb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#bfb9b2]" />
          <input
            type="text"
            placeholder="Buscar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#e9e3da] bg-white pl-9 pr-4 py-2 text-sm text-[#3d3630] placeholder-[#bfb9b2] outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-100 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {filters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                filter === value
                  ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                  : 'text-[#8c8279] hover:bg-[#f4f1ec] hover:text-[#3d3630]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#e9e3da] bg-white py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-[#6b6259] font-medium">Sin resultados</p>
            <p className="text-[#a09890] text-sm mt-1">
              {search ? 'Probá con otra búsqueda' : 'Tu primera idea está a un clic'}
            </p>
            {!search && (
              <button
                onClick={() => openModal()}
                className="mt-4 rounded-lg bg-violet-50 px-4 py-2 text-sm text-violet-700 ring-1 ring-violet-200 hover:bg-violet-100"
              >
                Crear entrada
              </button>
            )}
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#bfb9b2]">
                  Fijadas
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pinned.map((item) => (
                    <IdeaCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
            {rest.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#bfb9b2]">
                    Todas
                  </p>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((item) => (
                    <IdeaCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
