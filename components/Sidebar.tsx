'use client'

import { useStore } from '@/lib/store'
import { CATEGORY_CONFIG, Category, View } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Lightbulb,
  BookOpen,
  Calendar,
  Bot,
  Plus,
  Sparkles,
} from 'lucide-react'

const NAV_ITEMS: { view: View; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'ideas', label: 'Ideas', icon: Lightbulb },
  { view: 'libro', label: 'Libro', icon: BookOpen },
  { view: 'calendario', label: 'Calendario', icon: Calendar },
  { view: 'agente', label: 'Agente IA', icon: Bot },
]

const CATEGORY_ORDER: Category[] = ['idea', 'libro', 'evento', 'proyecto', 'personal']

export default function Sidebar() {
  const { activeView, setActiveView, items, openModal } = useStore()

  const countByCategory = (cat: Category) =>
    items.filter((i) => i.category === cat).length

  return (
    <aside className="flex w-60 flex-col border-r border-white/5 bg-[#0d0d14]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 ring-1 ring-violet-500/30">
          <Sparkles className="h-4 w-4 text-violet-400" />
        </div>
        <span className="text-base font-semibold tracking-tight text-white">
          Cerebro
        </span>
      </div>

      {/* New button */}
      <div className="px-3 pb-4">
        <button
          onClick={() => openModal()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-violet-500 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nueva entrada
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
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
                  ? 'bg-violet-500/15 text-violet-300 font-medium'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-violet-400' : 'text-slate-500'
                )}
              />
              {label}
              {view === 'agente' && (
                <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-violet-500/20 text-[9px] font-bold text-violet-400">
                  AI
                </span>
              )}
            </button>
          )
        })}

        {/* Categories */}
        <div className="pt-4">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
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
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-all hover:text-slate-200',
                  cfg.sidebar
                )}
              >
                <span
                  className={cn('h-2 w-2 shrink-0 rounded-full', cfg.dot)}
                />
                <span>{cfg.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                      cfg.bg,
                      cfg.text
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 p-4">
        <p className="text-center text-[10px] text-slate-600">
          {items.length} entradas guardadas
        </p>
      </div>
    </aside>
  )
}
