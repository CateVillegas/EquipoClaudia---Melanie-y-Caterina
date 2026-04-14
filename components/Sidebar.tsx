'use client'

import { useStore } from '@/lib/store'
import { CATEGORY_CONFIG, Category, View } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Lightbulb,
  Calendar,
  MessageCircleHeart,
  Plus,
  Brain,
} from 'lucide-react'

const NAV_ITEMS: { view: View; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { view: 'ideas', label: 'Ideas & Proyectos', icon: Lightbulb },
  { view: 'calendario', label: 'Calendario', icon: Calendar },
  { view: 'agente', label: 'Mi asistente', icon: MessageCircleHeart },
]

const CATEGORY_ORDER: Category[] = ['idea', 'evento', 'proyecto', 'personal', 'persona']

export default function Sidebar() {
  const { activeView, setActiveView, items, openModal } = useStore()

  const countByCategory = (cat: Category) =>
    items.filter((i) => i.category === cat).length

  return (
    <aside className="flex w-60 flex-col border-r border-[#e9e3da] bg-[#f4f1ec]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 ring-1 ring-violet-200">
          <Brain className="h-4 w-4 text-violet-600" />
        </div>
        <span className="text-base font-semibold tracking-tight text-[#1c1815]">
          Cerebro
        </span>
      </div>

      {/* New button */}
      <div className="px-3 pb-4">
        <button
          onClick={() => openModal()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6d5fd3] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#5e50c4] active:scale-[0.98] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nueva entrada
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#a09890]">
          Navegación
        </p>
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
          const isActive = activeView === view
          return (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                isActive
                  ? 'bg-white text-[#6d5fd3] font-medium shadow-sm ring-1 ring-[#e9e3da]'
                  : 'text-[#6b6259] hover:bg-white/60 hover:text-[#1c1815]'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-[#6d5fd3]' : 'text-[#a09890]'
                )}
              />
              {label}
              {view === 'agente' && (
                <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-violet-100 text-[9px] font-bold text-violet-600">
                  IA
                </span>
              )}
            </button>
          )
        })}

        {/* Categories */}
        <div className="pt-4">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#a09890]">
            Categorías
          </p>
          {CATEGORY_ORDER.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat]
            const count = countByCategory(cat)
            return (
              <button
                key={cat}
                onClick={() => openModal(cat)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#6b6259] transition-all hover:text-[#1c1815]',
                  cfg.sidebar
                )}
              >
                <span className={cn('h-2 w-2 shrink-0 rounded-full', cfg.dot)} />
                <span>{cfg.label}</span>
                {count > 0 && (
                  <span className={cn('ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium', cfg.bg, cfg.text)}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[#e9e3da] p-4">
        <p className="text-center text-[10px] text-[#a09890]">
          {items.length} {items.length === 1 ? 'recuerdo guardado' : 'recuerdos guardados'}
        </p>
      </div>
    </aside>
  )
}
