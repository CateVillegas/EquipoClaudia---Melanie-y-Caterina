'use client'

import { useState } from 'react'
import { Item, CATEGORY_CONFIG } from '@/lib/types'
import { useStore } from '@/lib/store'
import { cn, formatDate, truncate } from '@/lib/utils'
import { Pin, Trash2, Tag, Calendar } from 'lucide-react'

interface IdeaCardProps {
  item: Item
}

export default function IdeaCard({ item }: IdeaCardProps) {
  const { deleteItem, togglePin } = useStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const cfg = CATEGORY_CONFIG[item.category]

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded-xl border p-4 transition-all hover:border-white/10',
        'bg-[#111118] border-white/5',
        item.pinned && 'border-violet-500/20 bg-violet-500/5'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              cfg.bg,
              cfg.text
            )}
          >
            {cfg.emoji} {cfg.label}
          </span>
          {item.pinned && (
            <Pin className="h-3 w-3 shrink-0 text-violet-400 fill-violet-400" />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => togglePin(item.id)}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              item.pinned
                ? 'text-violet-400 hover:bg-violet-500/20'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
            )}
            title={item.pinned ? 'Desfijar' : 'Fijar'}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          {showConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => deleteItem(item.id)}
                className="rounded-md bg-red-500/20 px-2 py-1 text-[10px] font-medium text-red-400 hover:bg-red-500/30"
              >
                Eliminar
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-md px-2 py-1 text-[10px] text-slate-500 hover:text-slate-300"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-100 leading-snug">
        {item.title}
      </h3>

      {/* Content */}
      <p className="text-sm text-slate-400 leading-relaxed">
        {truncate(item.content, 150)}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {item.date && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <Calendar className="h-3 w-3" />
            {formatDate(item.date)}
          </span>
        )}
        {item.chapter && (
          <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">
            {item.chapter}
          </span>
        )}
        {item.tags?.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-500"
          >
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </span>
        ))}
      </div>

      {/* Date */}
      <p className="text-[10px] text-slate-600">
        {formatDate(item.updatedAt)}
      </p>
    </div>
  )
}
