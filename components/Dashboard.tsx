'use client'

import { useStore } from '@/lib/store'
import { getCategoryConfig } from '@/lib/types'
import { cn, formatDate } from '@/lib/utils'
import {
  Sparkles,
  Calendar,
  ArrowRight,
  User,
  Star,
} from 'lucide-react'
import {
  parseISO,
  isAfter,
  isBefore,
  addDays,
  subDays,
  getHours,
  differenceInDays,
  format,
  startOfDay,
} from 'date-fns'
import { es } from 'date-fns/locale'

function getGreeting() {
  const h = getHours(new Date())
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function Dashboard() {
  const { items, setActiveView, openModal, categories } = useStore()

  const now = new Date()
  const today = startOfDay(now)

  // This month count + growth
  const thisMonthCount = items.filter((i) => {
    const d = parseISO(i.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const lastMonthCount = items.filter((i) => {
    const d = parseISO(i.createdAt)
    const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return d.getMonth() === lm && d.getFullYear() === ly
  }).length

  const monthGrowth = lastMonthCount > 0
    ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
    : thisMonthCount > 0 ? 100 : 0

  // Pinned / favorites
  const favorites = items.filter((i) => i.pinned)

  // Next event
  const nextEvent = items
    .filter((i) => {
      if (i.category !== 'evento' || !i.date) return false
      return isAfter(parseISO(i.date), subDays(today, 1))
    })
    .sort((a, b) => (a.date! > b.date! ? 1 : -1))[0]

  const daysUntilNext = nextEvent?.date
    ? differenceInDays(parseISO(nextEvent.date), today)
    : null

  // Weekly activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(today, 6 - i)
    const dayStr = format(day, 'yyyy-MM-dd')
    return {
      label: format(day, 'EEE', { locale: es }),
      count: items.filter((item) => item.createdAt.slice(0, 10) === dayStr).length,
    }
  })
  const maxWeekly = Math.max(...last7Days.map((d) => d.count), 1)

  // Upcoming events
  const upcoming = items
    .filter((i) => {
      if (i.category !== 'evento' || !i.date) return false
      const d = parseISO(i.date)
      return isAfter(d, now) && isBefore(d, addDays(now, 30))
    })
    .sort((a, b) => (a.date! > b.date! ? 1 : -1))
    .slice(0, 3)

  // Category breakdown (only non-empty)
  const categoryBreakdown = categories
    .map((cat) => ({
      key: cat.key,
      count: items.filter((i) => i.category === cat.key).length,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)

  // Recent
  const recent = [...items]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)

  return (
    <div className="min-h-screen p-6 pb-12 animate-fade-in max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <h1 className="text-2xl font-semibold text-[#1c1815] tracking-tight">
            {getGreeting()}
          </h1>
        </div>
        <p className="text-[#8c8279] text-sm">
          Tu resumen de Cerebro
        </p>
      </div>

      {/* 3 stat cards — the only numbers you need */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-xl border border-[#e9e3da] bg-white p-5 text-center">
          <p className="text-3xl font-bold text-[#1c1815]">{items.length}</p>
          <p className="text-xs text-[#8c8279] mt-1">entradas guardadas</p>
        </div>
        <div className="rounded-xl border border-[#e9e3da] bg-white p-5 text-center">
          <p className="text-3xl font-bold text-[#1c1815]">
            {thisMonthCount}
            {monthGrowth !== 0 && (
              <span className={cn(
                'text-sm font-semibold ml-1.5',
                monthGrowth > 0 ? 'text-emerald-500' : 'text-rose-500'
              )}>
                {monthGrowth > 0 ? '+' : ''}{monthGrowth}%
              </span>
            )}
          </p>
          <p className="text-xs text-[#8c8279] mt-1">nuevas este mes</p>
        </div>
        <div className="rounded-xl border border-[#e9e3da] bg-white p-5 text-center">
          {nextEvent ? (
            <>
              <p className="text-3xl font-bold text-[#1c1815]">
                {daysUntilNext === 0 ? 'Hoy' : daysUntilNext === 1 ? '1d' : `${daysUntilNext}d`}
              </p>
              <p className="text-xs text-[#8c8279] mt-1 truncate" title={nextEvent.title}>
                {nextEvent.title}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-[#d4cfc9]">--</p>
              <p className="text-xs text-[#8c8279] mt-1">sin eventos</p>
            </>
          )}
        </div>
      </div>

      {/* Category pills — quick glance at where your stuff lives */}
      {categoryBreakdown.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#3d3630] mb-3">Tus categorías</h2>
          <div className="flex flex-wrap gap-2">
            {categoryBreakdown.map(({ key, count }) => {
              const cfg = getCategoryConfig(key, categories)
              return (
                <button
                  key={key}
                  onClick={() => key === 'evento' ? setActiveView('calendario') : setActiveView('ideas')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-all hover:shadow-sm',
                    cfg.border, cfg.bg
                  )}
                >
                  <span>{cfg.emoji}</span>
                  <span className={cn('font-medium', cfg.text)}>{cfg.label}</span>
                  <span className="text-[#a09890] text-xs">{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Favorites — ideas you can't forget */}
      {favorites.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-[#3d3630]">No pierdas de vista</h2>
          </div>
          <div className={cn(
            'grid gap-2.5',
            favorites.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          )}>
            {favorites.slice(0, 4).map((item) => {
              const cfg = getCategoryConfig(item.category, categories)
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4"
                >
                  <span className="text-lg mt-0.5">{cfg.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1c1815]">{item.title}</p>
                    <p className="text-xs text-[#8c8279] mt-0.5 line-clamp-2">{item.content}</p>
                    {item.personName && (
                      <p className="text-[11px] text-sky-600 flex items-center gap-1 mt-1">
                        <User className="h-2.5 w-2.5" /> {item.personName}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {favorites.length > 4 && (
            <button
              onClick={() => setActiveView('ideas')}
              className="mt-2 text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              Ver las {favorites.length} favoritas <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Two columns: events + weekly chart */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Upcoming events */}
        <div className="rounded-xl border border-[#e9e3da] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#3d3630]">Próximos eventos</h2>
            <button onClick={() => setActiveView('calendario')} className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1">
              Ver <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-4">
              <Calendar className="mx-auto mb-2 h-7 w-7 text-[#d4cfc9]" />
              <p className="text-sm text-[#a09890]">Nada agendado</p>
              <button onClick={() => openModal('evento')} className="mt-2 text-xs text-violet-600 hover:text-violet-700">
                + Crear evento
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcoming.map((item) => {
                const daysLeft = differenceInDays(parseISO(item.date!), today)
                return (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                    <div className="shrink-0 text-center leading-tight">
                      <p className="text-lg font-bold text-emerald-700">
                        {format(parseISO(item.date!), 'd')}
                      </p>
                      <p className="text-[10px] uppercase text-emerald-600">
                        {format(parseISO(item.date!), 'MMM', { locale: es })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1c1815] truncate">{item.title}</p>
                      <p className="text-[11px] text-emerald-600">
                        {daysLeft === 0 ? 'Hoy' : daysLeft === 1 ? 'Mañana' : `En ${daysLeft} días`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Weekly activity */}
        <div className="rounded-xl border border-[#e9e3da] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#3d3630] mb-4">Tu semana</h2>
          <div className="flex items-end gap-2.5 h-32">
            {last7Days.map((day, i) => {
              const isToday = i === 6
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  {day.count > 0 && (
                    <span className="text-[10px] font-bold text-[#6b6259]">{day.count}</span>
                  )}
                  <div className="w-full rounded-md bg-[#f4f1ec] relative" style={{ height: '90px' }}>
                    <div
                      className={cn(
                        'absolute bottom-0 left-0 right-0 rounded-md transition-all',
                        isToday ? 'bg-violet-500' : 'bg-violet-300'
                      )}
                      style={{
                        height: day.count > 0 ? `${Math.max((day.count / maxWeekly) * 100, 8)}%` : '0%',
                      }}
                    />
                  </div>
                  <span className={cn(
                    'text-[10px] capitalize',
                    isToday ? 'font-semibold text-violet-600' : 'text-[#a09890]'
                  )}>
                    {day.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent activity — simple list */}
      <div>
        <h2 className="text-sm font-semibold text-[#3d3630] mb-3">Reciente</h2>
        <div className="rounded-xl border border-[#e9e3da] bg-white divide-y divide-[#f4f1ec]">
          {recent.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[#a09890]">Todavía no guardaste nada</p>
              <button onClick={() => setActiveView('agente')} className="mt-2 text-xs text-violet-600 hover:text-violet-700">
                Empezar con el agente
              </button>
            </div>
          ) : (
            recent.map((item) => {
              const cfg = getCategoryConfig(item.category, categories)
              const daysAgo = differenceInDays(today, startOfDay(parseISO(item.updatedAt)))
              const timeLabel = daysAgo === 0 ? 'Hoy' : daysAgo === 1 ? 'Ayer' : `Hace ${daysAgo}d`
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="text-base">{cfg.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1c1815] truncate">{item.title}</p>
                    {item.personName && (
                      <p className="text-[11px] text-sky-600 flex items-center gap-1 mt-0.5">
                        <User className="h-2.5 w-2.5" /> {item.personName}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-[#a09890]">{timeLabel}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
