'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Item } from '@/lib/types'
import {
  cn,
  getCalendarDays,
  isCurrentMonth,
  isSameDayCheck,
  toISODateString,
  formatDate,
} from '@/lib/utils'
import { ChevronLeft, ChevronRight, Plus, X, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function CalendarView() {
  const { items, openModal } = useStore()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const calDays = getCalendarDays(year, month)

  const eventsByDate = items
    .filter((i) => i.category === 'evento' && i.date)
    .reduce<Record<string, Item[]>>((acc, item) => {
      const key = item.date!
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const selectedDateStr = selectedDay ? toISODateString(selectedDay) : null
  const selectedEvents = selectedDateStr ? (eventsByDate[selectedDateStr] ?? []) : []

  return (
    <div className="flex h-full animate-fade-in">
      {/* Calendar */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Calendario
            </h1>
            <p className="text-sm text-slate-500">
              {Object.keys(eventsByDate).length} días con eventos
            </p>
          </div>
          <button
            onClick={() => openModal('evento')}
            className="flex items-center gap-2 rounded-lg bg-emerald-600/15 px-4 py-2 text-sm font-medium text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-600/25"
          >
            <Plus className="h-4 w-4" />
            Nuevo evento
          </button>
        </div>

        {/* Month nav */}
        <div className="mb-5 flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="flex-1 text-center text-base font-semibold capitalize text-white">
            {format(new Date(year, month), 'MMMM yyyy', { locale: es })}
          </h2>
          <button
            onClick={nextMonth}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calDays.map((day, idx) => {
            const dateStr = toISODateString(day)
            const isThisMonth = isCurrentMonth(day, year, month)
            const isToday = isSameDayCheck(day, now)
            const isSelected = selectedDay ? isSameDayCheck(day, selectedDay) : false
            const dayEvents = eventsByDate[dateStr] ?? []
            const hasEvents = dayEvents.length > 0

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={cn(
                  'relative flex flex-col items-center rounded-xl py-2 px-1 min-h-[60px] transition-all',
                  !isThisMonth && 'opacity-25',
                  isSelected
                    ? 'bg-emerald-500/20 ring-1 ring-emerald-500/40'
                    : isToday
                    ? 'bg-violet-500/15 ring-1 ring-violet-500/30'
                    : 'hover:bg-white/5',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    isToday && !isSelected && 'text-violet-300',
                    isSelected && 'bg-emerald-500 text-white',
                    !isToday && !isSelected && 'text-slate-400'
                  )}
                >
                  {format(day, 'd')}
                </span>

                {/* Event dots */}
                {hasEvents && (
                  <div className="mt-1 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-emerald-400">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sidebar panel */}
      <div className="w-72 border-l border-white/5 bg-[#0d0d14] p-5">
        {selectedDay ? (
          <div className="animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  {format(selectedDay, 'EEEE', { locale: es })}
                </p>
                <p className="text-lg font-semibold text-white capitalize">
                  {format(selectedDay, "d 'de' MMMM", { locale: es })}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="rounded-lg p-1.5 text-slate-600 hover:bg-white/5 hover:text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Calendar className="mb-2 h-8 w-8 text-slate-700" />
                <p className="text-sm text-slate-600">Sin eventos</p>
                <button
                  onClick={() => openModal('evento')}
                  className="mt-3 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  + Crear evento este día
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3"
                  >
                    <p className="font-semibold text-sm text-emerald-300">
                      {item.title}
                    </p>
                    {item.content && (
                      <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                        {item.content}
                      </p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => openModal('evento')}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 py-2 text-xs text-slate-600 hover:border-emerald-500/20 hover:text-emerald-400 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar otro evento
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm font-semibold text-slate-300">
              Próximos eventos
            </p>
            <div className="space-y-2">
              {Object.entries(eventsByDate)
                .filter(([d]) => d >= toISODateString(now))
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(0, 8)
                .map(([date, events]) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDay(parseISO(date))}
                    className="w-full rounded-xl border border-white/5 bg-[#111118] p-3 text-left hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all"
                  >
                    <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {formatDate(date)}
                    </p>
                    {events.map((e) => (
                      <p key={e.id} className="mt-0.5 truncate text-xs text-slate-300">
                        {e.title}
                      </p>
                    ))}
                  </button>
                ))}
              {Object.keys(eventsByDate).filter((d) => d >= toISODateString(now)).length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-600">Sin eventos próximos</p>
                  <button
                    onClick={() => openModal('evento')}
                    className="mt-2 text-xs text-emerald-400"
                  >
                    + Crear evento
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
