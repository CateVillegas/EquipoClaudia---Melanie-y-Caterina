'use client'

import { useStore } from '@/lib/store'
import { View } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Lightbulb,
  Calendar,
  Plus,
  Brain,
  Crown,
} from 'lucide-react'

const NAV_ITEMS: { view: View; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { view: 'ideas', label: 'Ideas & Proyectos', icon: Lightbulb },
  { view: 'calendario', label: 'Calendario', icon: Calendar },
]

export default function Sidebar() {
  const { activeView, setActiveView, items, openModal } = useStore()

  const toggleView = (view: View) => {
    // If already showing this panel, close it (go back to chat-only)
    setActiveView(activeView === view ? 'agente' : view)
  }

  return (
    <aside className="flex w-[56px] flex-col items-center border-r border-[#e9e3da] bg-[#f4f1ec] py-4">
      {/* Logo */}
      <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 ring-1 ring-violet-200">
        <Brain className="h-4.5 w-4.5 text-violet-600" />
      </div>

      {/* Nav icons */}
      <nav className="flex flex-col items-center gap-1.5">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
          const isActive = activeView === view
          return (
            <button
              key={view}
              onClick={() => toggleView(view)}
              title={label}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                isActive
                  ? 'bg-white text-[#6d5fd3] shadow-sm ring-1 ring-[#e9e3da]'
                  : 'text-[#a09890] hover:bg-white/60 hover:text-[#6b6259]'
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </button>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Pro button */}
      <button
        onClick={() => toggleView('pro')}
        title="Cerebro Pro"
        className={cn(
          'mb-2 flex h-10 w-10 items-center justify-center rounded-xl transition-all',
          activeView === 'pro'
            ? 'bg-gradient-to-br from-violet-500 to-amber-400 text-white shadow-sm ring-1 ring-violet-300'
            : 'text-[#a09890] hover:bg-violet-50 hover:text-violet-500'
        )}
      >
        <Crown className="h-[18px] w-[18px]" />
      </button>

      {/* Item count */}
      <p className="mb-2 text-[9px] font-semibold text-[#bfb9b2]">{items.length}</p>

      {/* New item */}
      <button
        onClick={() => openModal()}
        title="Nueva entrada"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6d5fd3] text-white shadow-sm transition-all hover:bg-[#5e50c4] active:scale-95"
      >
        <Plus className="h-[18px] w-[18px]" />
      </button>
    </aside>
  )
}
