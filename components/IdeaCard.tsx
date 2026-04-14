'use client'

import { useState } from 'react'
import { Item, CATEGORY_CONFIG } from '@/lib/types'
import { useStore } from '@/lib/store'
import { cn, formatDate, truncate } from '@/lib/utils'
import { Pin, Trash2, Tag, Calendar, RefreshCw, User } from 'lucide-react'

const RECURRENCE_LABEL: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
}

export default function IdeaCard({ item }: { item: Item }) {
  const { deleteItem, togglePin } = useStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const cfg = CATEGORY_CONFIG[item.category]

  return (
    <div className={cn(
      'group relative flex flex-col gap-3 rounded-xl border p-4 transition-all hover:shadow-sm',
      'bg-white border-[#e9e3da]',
      item.pinned && 'border-violet-200 bg-violet-50/40'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', cfg.bg, cfg.text)}>
            {cfg.emoji} {cfg.label}
          </span>
          {item.pinned && <Pin className="h-3 w-3 shrink-0 text-violet-500 fill-violet-500" />}
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => togglePin(item.id)}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              item.pinned ? 'text-violet-500 hover:bg-violet-100' : 'text-[#a09890] hover:bg-[#f4f1ec] hover:text-[#6b6259]'
            )}
            title={item.pinned ? 'Desfijar' : 'Fijar'}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          {showConfirm ? (
            <div className="flex items-center gap-1">
              <button onClick={() => deleteItem(item.id)} className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-100">
                Eliminar
              </button>
              <button onClick={() => setShowConfirm(false)} className="rounded-md px-2 py-1 text-[10px] text-[#a09890] hover:text-[#6b6259]">
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={() => setShowConfirm(true)} className="rounded-md p-1.5 text-[#a09890] transition-colors hover:bg-red-50 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Person name */}
      {item.personName && (
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 text-sky-500" />
          <span className="text-xs font-medium text-sky-700">{item.personName}</span>
        </div>
      )}

      {/* Title */}
      <h3 className="text-sm font-semibold text-[#1c1815] leading-snug">{item.title}</h3>

      {/* Content */}
      <p className="text-sm text-[#6b6259] leading-relaxed">{truncate(item.content, 150)}</p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {item.date && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-700">
            <Calendar className="h-3 w-3" />
            {formatDate(item.date)}
          </span>
        )}
        {item.recurrence && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] text-emerald-700">
            <RefreshCw className="h-2.5 w-2.5" />
            {RECURRENCE_LABEL[item.recurrence.frequency]}
            {item.recurrence.endDate && ` · hasta ${formatDate(item.recurrence.endDate)}`}
          </span>
        )}
        {item.tags?.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-md bg-[#f4f1ec] px-2 py-0.5 text-[10px] text-[#8c8279]">
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </span>
        ))}
      </div>

      <p className="text-[10px] text-[#bfb9b2]">{formatDate(item.updatedAt)}</p>
    </div>
  )
}
