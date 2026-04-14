'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { CATEGORY_CONFIG, Category } from '@/lib/types'
import { cn } from '@/lib/utils'
import IdeaCard from './IdeaCard'
import Header from './Header'
import { Search } from 'lucide-react'

const FILTERS: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'idea', label: '💡 Ideas' },
  { value: 'proyecto', label: '🚀 Proyectos' },
  { value: 'personal', label: '🌿 Personal' },
]

export default function IdeasView() {
  const { items, openModal } = useStore()
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = items
    .filter((i) => i.category !== 'libro' && i.category !== 'evento')
    .filter((i) => filter === 'all' || i.category === filter)
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
        subtitle={`${filtered.length} entradas`}
        action={{ label: 'Nueva entrada', onClick: () => openModal() }}
      />

      {/* Filters + Search */}
      <div className="px-6 pb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Buscar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/5 bg-[#111118] pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                filter === value
                  ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-[#111118] py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-400 font-medium">Sin resultados</p>
            <p className="text-slate-600 text-sm mt-1">
              {search ? 'Prueba con otra búsqueda' : 'Crea tu primera entrada'}
            </p>
            {!search && (
              <button
                onClick={() => openModal()}
                className="mt-4 rounded-lg bg-violet-600/15 px-4 py-2 text-sm text-violet-400 hover:bg-violet-600/25"
              >
                Crear entrada
              </button>
            )}
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-600">
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
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-600">
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
