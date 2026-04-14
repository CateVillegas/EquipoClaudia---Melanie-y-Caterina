'use client'

import { useStore } from '@/lib/store'
import { CATEGORY_CONFIG, Category } from '@/lib/types'
import { cn, formatDate } from '@/lib/utils'
import { Sparkles, TrendingUp, Calendar, Lightbulb, Rocket, Leaf, ArrowRight, User } from 'lucide-react'
import { parseISO, isAfter, isBefore, addDays, getHours } from 'date-fns'

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  idea: Lightbulb,
  evento: Calendar,
  proyecto: Rocket,
  personal: Leaf,
  persona: User,
}

function getGreeting() {
  const h = getHours(new Date())
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
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

  const counts = (['idea', 'evento', 'proyecto', 'personal', 'persona'] as Category[]).map(
    (cat) => ({ cat, count: items.filter((i) => i.category === cat).length })
  )

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <h1 className="text-2xl font-semibold text-[#1c1815] tracking-tight">
            {getGreeting()} 👋
          </h1>
        </div>
        <p className="text-[#8c8279] text-sm">
          {items.length === 0
            ? 'Tu cerebro está listo. ¿Qué querés guardar hoy?'
            : `Tenés ${items.length} ${items.length === 1 ? 'entrada guardada' : 'entradas guardadas'}. ¿En qué vas a trabajar hoy?`}
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
                if (cat === 'evento') setActiveView('calendario')
                else setActiveView('ideas')
              }}
              className="flex flex-col gap-3 rounded-xl border border-[#e9e3da] bg-white p-4 text-left transition-all hover:shadow-sm hover:scale-[1.02] active:scale-[0.99]"
            >
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', cfg.bg)}>
                <Icon className={cn('h-4 w-4', cfg.text)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1c1815]">{count}</p>
                <p className="text-xs text-[#8c8279]">{cfg.label}s</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Upcoming events */}
        <div className="col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#3d3630]">Próximos eventos</h2>
            <button onClick={() => setActiveView('calendario')} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700">
              Ver todos <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {upcoming.length === 0 ? (
              <div className="rounded-xl border border-[#e9e3da] bg-white p-4 text-center">
                <Calendar className="mx-auto mb-2 h-6 w-6 text-[#d4cfc9]" />
                <p className="text-xs text-[#a09890]">Sin eventos próximos</p>
                <button onClick={() => openModal('evento')} className="mt-2 text-xs text-violet-600 hover:text-violet-700">
                  Crear evento
                </button>
              </div>
            ) : (
              upcoming.map((item) => (
                <div key={item.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs font-medium text-emerald-700">{item.date && formatDate(item.date)}</p>
                  <p className="mt-0.5 text-sm text-[#1c1815]">{item.title}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pinned */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#3d3630]">Fijadas</h2>
            <TrendingUp className="h-4 w-4 text-[#d4cfc9]" />
          </div>
          {pinned.length === 0 ? (
            <div className="rounded-xl border border-[#e9e3da] bg-white p-6 text-center">
              <p className="text-xs text-[#a09890]">Fijá las entradas importantes con el botón 📌</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {pinned.map((item) => {
                const cfg = CATEGORY_CONFIG[item.category]
                return (
                  <div key={item.id} className={cn('rounded-xl border p-3 transition-all', cfg.border, cfg.bg)}>
                    <span className={cn('text-[10px] font-semibold', cfg.text)}>{cfg.emoji} {cfg.label}</span>
                    {item.personName && (
                      <p className="mt-0.5 text-[10px] text-sky-600 flex items-center gap-1">
                        <User className="h-2.5 w-2.5" /> {item.personName}
                      </p>
                    )}
                    <p className="mt-1.5 text-sm font-medium text-[#1c1815] leading-snug">{item.title}</p>
                    <p className="mt-1 text-xs text-[#8c8279] line-clamp-2">{item.content}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-[#3d3630] mb-3">Actividad reciente</h2>
        <div className="rounded-xl border border-[#e9e3da] bg-white divide-y divide-[#f4f1ec]">
          {recent.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-[#a09890]">Todavía no hay nada guardado — ¡empezá hoy!</p>
            </div>
          ) : (
            recent.map((item) => {
              const cfg = CATEGORY_CONFIG[item.category]
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f6] transition-colors">
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', cfg.dot)} />
                  <span className="flex-1 truncate text-sm text-[#3d3630]">{item.title}</span>
                  {item.personName && (
                    <span className="shrink-0 text-[10px] text-sky-600 flex items-center gap-0.5">
                      <User className="h-2.5 w-2.5" />{item.personName}
                    </span>
                  )}
                  <span className={cn('shrink-0 text-[10px] font-medium', cfg.text)}>{cfg.label}</span>
                  <span className="shrink-0 text-[10px] text-[#a09890]">{formatDate(item.updatedAt)}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
