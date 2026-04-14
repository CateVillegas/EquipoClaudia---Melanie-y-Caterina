'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useT } from '@/lib/i18n'
import { Item } from '@/lib/types'
import {
  cn,
  getCalendarDays,
  isCurrentMonth,
  isSameDayCheck,
  toISODateString,
  formatDate,
} from '@/lib/utils'
import { ChevronLeft, ChevronRight, Plus, X, Calendar, RefreshCw } from 'lucide-react'
import { format, parseISO, addDays, addWeeks, addMonths, isAfter } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

// Expande eventos recurrentes en un mapa fecha → items
function buildEventsByDate(items: Item[]): Record<string, Item[]> {
  const result: Record<string, Item[]> = {}
  const maxDate = addMonths(new Date(), 6)

  for (const item of items) {
    if (!item.date) continue
    if (item.category !== 'evento' && item.category !== 'persona') continue

    if (!item.recurrence) {
      if (!result[item.date]) result[item.date] = []
      result[item.date].push(item)
      continue
    }

    const endLimit = item.recurrence.endDate
      ? parseISO(item.recurrence.endDate) < maxDate
        ? parseISO(item.recurrence.endDate)
        : maxDate
      : maxDate

    let current = parseISO(item.date)
    while (!isAfter(current, endLimit)) {
      const key = toISODateString(current)
      if (!result[key]) result[key] = []
      result[key].push(item)

      if (item.recurrence.frequency === 'daily') {
        current = addDays(current, 1)
      } else if (item.recurrence.frequency === 'weekly') {
        current = addWeeks(current, 1)
      } else {
        current = addMonths(current, 1)
      }
    }
  }

  return result
}

export default function CalendarView() {
  const { items, openModal, language } = useStore()
  const t = useT()
  const locale = language === 'es' ? es : enUS

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const calDays = getCalendarDays(year, month)
  const eventsByDate = buildEventsByDate(items)

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1c1815] tracking-tight">{t.calendar.title}</h1>
            <p className="text-sm text-[#8c8279]">
              {t.calendar.daysWithEvents(Object.keys(eventsByDate).length)}
            </p>
          </div>
          <button
            onClick={() => openModal('evento')}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t.calendar.newEvent}
          </button>
        </div>

        {/* Month nav */}
        <div className="mb-5 flex items-center gap-4">
          <button onClick={prevMonth} className="rounded-lg p-2 text-[#8c8279] hover:bg-[#f4f1ec] hover:text-[#1c1815] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="flex-1 text-center text-base font-semibold capitalize text-[#1c1815]">
            {format(new Date(year, month), 'MMMM yyyy', { locale })}
          </h2>
          <button onClick={nextMonth} className="rounded-lg p-2 text-[#8c8279] hover:bg-[#f4f1ec] hover:text-[#1c1815] transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {t.calendar.weekdays.map((day) => (
            <div key={day} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[#bfb9b2]">
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
            const hasRecurring = dayEvents.some((e) => e.recurrence)

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={cn(
                  'relative flex flex-col items-center rounded-xl py-2 px-1 min-h-[60px] transition-all',
                  !isThisMonth && 'opacity-25',
                  isSelected
                    ? 'bg-emerald-50 ring-1 ring-emerald-200'
                    : isToday
                    ? 'bg-violet-50 ring-1 ring-violet-200'
                    : 'hover:bg-[#f4f1ec]',
                )}
              >
                <span className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  isToday && !isSelected && 'text-violet-600 font-semibold',
                  isSelected && 'bg-emerald-500 text-white',
                  !isToday && !isSelected && 'text-[#6b6259]'
                )}>
                  {format(day, 'd')}
                </span>

                {hasEvents && (
                  <div className="mt-1 flex gap-0.5 items-center">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    ))}
                    {hasRecurring && (
                      <RefreshCw className="h-2 w-2 text-emerald-500 ml-0.5" />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sidebar panel */}
      <div className="w-72 border-l border-[#e9e3da] bg-[#f4f1ec] p-5">
        {selectedDay ? (
          <div className="animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#a09890]">{format(selectedDay, 'EEEE', { locale })}</p>
                <p className="text-lg font-semibold text-[#1c1815] capitalize">
                  {format(selectedDay, "d 'de' MMMM", { locale })}
                </p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="rounded-lg p-1.5 text-[#a09890] hover:bg-[#e9e3da] hover:text-[#6b6259]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Calendar className="mb-2 h-8 w-8 text-[#d4cfc9]" />
                <p className="text-sm text-[#a09890]">{t.calendar.noEventsToday}</p>
                <button onClick={() => openModal('evento')} className="mt-3 text-xs text-emerald-700 hover:text-emerald-800">
                  {t.calendar.createEvent}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="rounded-xl border border-emerald-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-emerald-700 leading-snug">{item.title}</p>
                      {item.recurrence && (
                        <span className="shrink-0 flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] text-emerald-600">
                          <RefreshCw className="h-2.5 w-2.5" />
                          {t.calendar.recurrence[item.recurrence.frequency]}
                        </span>
                      )}
                    </div>
                    {item.recurrence?.endDate && (
                      <p className="mt-0.5 text-[10px] text-[#a09890]">
                        {t.calendar.until(formatDate(item.recurrence.endDate))}
                      </p>
                    )}
                    {item.content && (
                      <p className="mt-1.5 text-xs text-[#6b6259] leading-relaxed">{item.content}</p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span key={tag} className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => openModal('evento')}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#d4cfc9] py-2 text-xs text-[#a09890] hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t.calendar.addEvent}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm font-semibold text-[#3d3630]">{t.calendar.upcoming}</p>
            <div className="space-y-2">
              {Object.entries(eventsByDate)
                .filter(([d]) => d >= toISODateString(now))
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(0, 8)
                .map(([date, events]) => {
                  const uniqueEvents = Array.from(
                    new Map(events.map((e) => [e.id, e])).values()
                  )
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDay(parseISO(date))}
                      className="w-full rounded-xl border border-[#e9e3da] bg-white p-3 text-left hover:border-emerald-200 hover:bg-emerald-50 transition-all"
                    >
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                        {formatDate(date)}
                      </p>
                      {uniqueEvents.slice(0, 2).map((e) => (
                        <p key={e.id} className="mt-0.5 truncate text-xs text-[#3d3630] flex items-center gap-1">
                          {e.recurrence && <RefreshCw className="h-2.5 w-2.5 text-emerald-500 shrink-0" />}
                          {e.title}
                        </p>
                      ))}
                      {uniqueEvents.length > 2 && (
                        <p className="mt-0.5 text-[10px] text-[#a09890]">+{uniqueEvents.length - 2} más</p>
                      )}
                    </button>
                  )
                })}
              {Object.keys(eventsByDate).filter((d) => d >= toISODateString(now)).length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-[#a09890]">{t.calendar.noUpcoming}</p>
                  <button onClick={() => openModal('evento')} className="mt-2 text-xs text-emerald-700 hover:text-emerald-800">
                    {t.calendar.createEvent}
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
