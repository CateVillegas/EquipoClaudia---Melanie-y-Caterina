'use client'

import { useStore } from '@/lib/store'
import { CATEGORY_CONFIG, Category } from '@/lib/types'
import { cn, formatDate } from '@/lib/utils'
import {
  Sparkles,
  TrendingUp,
  Calendar,
  BookOpen,
  Lightbulb,
  Rocket,
  Leaf,
  ArrowRight,
} from 'lucide-react'
import { parseISO, isAfter, isBefore, addDays } from 'date-fns'

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  idea: Lightbulb,
  libro: BookOpen,
  evento: Calendar,
  proyecto: Rocket,
  personal: Leaf,
}

export default function Dashboard() {
  const { items, setActiveView, openModal } = useStore()

  const now = new Date()
  const upcoming = items
    .filter((i) => {
      if (i.category !== 'evento' || !i.date) return false
      const d = parseISO(i.date)
      return isAfter(d, now) && isBefore(d, addDays(now, 30))
    })
    .sort((a, b) => (a.date! > b.date! ? 1 : -1))
    .slice(0, 3)

  const pinned = items.filter((i) => i.pinned).slice(0, 4)
  const recent = items.slice(0, 5)

  const counts = (['idea', 'libro', 'evento', 'proyecto', 'personal'] as Category[]).map(
    (cat) => ({ cat, count: items.filter((i) => i.category === cat).length })
  )

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Buenos días
          </h1>
        </div>
        <p className="text-slate-500 text-sm">
          Tienes {items.length} entradas guardadas. ¿En qué vas a trabajar hoy?
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {counts.map(({ cat, count }) => {
          const cfg = CATEGORY_CONFIG[cat]
          const Icon = CATEGORY_ICONS[cat]
          return (
            <button
              key={cat}
              onClick={() => {
                if (cat === 'libro') setActiveView('libro')
                else if (cat === 'evento') setActiveView('calendario')
                else setActiveView('ideas')
              }}
              className={cn(
                'flex flex-col gap-3 rounded-xl border p-4 text-left transition-all hover:border-white/10 hover:scale-[1.02] active:scale-[0.99]',
                'bg-[#111118] border-white/5'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  cfg.bg
                )}
              >
                <Icon className={cn('h-4 w-4', cfg.text)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-xs text-slate-500">{cfg.label}s</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Upcoming events */}
        <div className="col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300">
              Próximos eventos
            </h2>
            <button
              onClick={() => setActiveView('calendario')}
              className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
            >
              Ver todos
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {upcoming.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-[#111118] p-4 text-center">
                <Calendar className="mx-auto mb-2 h-6 w-6 text-slate-600" />
                <p className="text-xs text-slate-600">Sin eventos próximos</p>
                <button
                  onClick={() => openModal('evento')}
                  className="mt-2 text-xs text-violet-400 hover:text-violet-300"
                >
                  Crear evento
                </button>
              </div>
            ) : (
              upcoming.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3"
                >
                  <p className="text-xs font-medium text-emerald-400">
                    {item.date && formatDate(item.date)}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-200">{item.title}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pinned */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300">
              Fijadas
            </h2>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </div>
          {pinned.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-[#111118] p-6 text-center">
              <p className="text-xs text-slate-600">
                Fija entradas importantes con el botón 📌
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {pinned.map((item) => {
                const cfg = CATEGORY_CONFIG[item.category]
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-xl border p-3 transition-all',
                      cfg.border,
                      cfg.bg
                    )}
                  >
                    <span className={cn('text-[10px] font-semibold', cfg.text)}>
                      {cfg.emoji} {cfg.label}
                    </span>
                    <p className="mt-1.5 text-sm font-medium text-slate-200 leading-snug">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {item.content}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">Actividad reciente</h2>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#111118] divide-y divide-white/5">
          {recent.map((item) => {
            const cfg = CATEGORY_CONFIG[item.category]
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors"
              >
                <span className={cn('h-2 w-2 shrink-0 rounded-full', cfg.dot)} />
                <span className="flex-1 truncate text-sm text-slate-300">
                  {item.title}
                </span>
                <span className={cn('shrink-0 text-[10px]', cfg.text)}>
                  {cfg.label}
                </span>
                <span className="shrink-0 text-[10px] text-slate-600">
                  {formatDate(item.updatedAt)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
