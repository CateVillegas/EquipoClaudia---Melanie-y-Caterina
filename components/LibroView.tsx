'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Item } from '@/lib/types'
import { cn, formatDate } from '@/lib/utils'
import Header from './Header'
import { BookOpen, ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react'

export default function LibroView() {
  const { items, openModal, deleteItem } = useStore()
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['all']))

  const bookItems = items.filter((i) => i.category === 'libro')

  // Group by chapter
  const chapters = bookItems.reduce<Record<string, Item[]>>((acc, item) => {
    const key = item.chapter || 'Sin capítulo'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const chapterNames = Object.keys(chapters).sort((a, b) => {
    if (a === 'Sin capítulo') return 1
    if (b === 'Sin capítulo') return -1
    return a.localeCompare(b, 'es')
  })

  const totalWords = bookItems.reduce(
    (sum, item) => sum + item.content.split(/\s+/).filter(Boolean).length,
    0
  )

  const toggleChapter = (ch: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(ch)) next.delete(ch)
      else next.add(ch)
      return next
    })
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <Header
        title="Libro"
        subtitle={`${bookItems.length} secciones · ${totalWords.toLocaleString('es')} palabras`}
        action={{ label: 'Nueva sección', onClick: () => openModal('libro') }}
      />

      {bookItems.length === 0 ? (
        <div className="px-6">
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-[#111118] py-20">
            <BookOpen className="mb-4 h-12 w-12 text-slate-700" />
            <p className="text-lg font-semibold text-slate-400">
              Empieza tu libro
            </p>
            <p className="mt-1 text-sm text-slate-600 text-center max-w-sm">
              Organiza tus escritos por capítulos. Cada sección puede tener su propio capítulo.
            </p>
            <button
              onClick={() => openModal('libro')}
              className="mt-6 flex items-center gap-2 rounded-lg bg-blue-500/15 px-5 py-2.5 text-sm font-medium text-blue-400 ring-1 ring-blue-500/20 hover:bg-blue-500/25"
            >
              <Plus className="h-4 w-4" />
              Primera sección
            </button>
          </div>
        </div>
      ) : (
        <div className="px-6 pb-6">
          {/* Stats bar */}
          <div className="mb-6 flex items-center gap-6 rounded-xl border border-blue-500/20 bg-blue-500/5 px-5 py-4">
            <div>
              <p className="text-xs text-slate-500">Secciones</p>
              <p className="text-2xl font-bold text-blue-400">{bookItems.length}</p>
            </div>
            <div className="h-10 w-px bg-blue-500/10" />
            <div>
              <p className="text-xs text-slate-500">Capítulos</p>
              <p className="text-2xl font-bold text-blue-400">{chapterNames.length}</p>
            </div>
            <div className="h-10 w-px bg-blue-500/10" />
            <div>
              <p className="text-xs text-slate-500">Palabras aprox.</p>
              <p className="text-2xl font-bold text-blue-400">
                {totalWords.toLocaleString('es')}
              </p>
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-3">
            {chapterNames.map((chapterName) => {
              const entries = chapters[chapterName]
              const isExpanded = expandedChapters.has(chapterName)

              return (
                <div
                  key={chapterName}
                  className="rounded-xl border border-white/5 bg-[#111118] overflow-hidden"
                >
                  {/* Chapter header */}
                  <button
                    onClick={() => toggleChapter(chapterName)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-white/3 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/15 shrink-0">
                      <BookOpen className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="flex-1 text-sm font-semibold text-slate-200">
                      {chapterName}
                    </span>
                    <span className="shrink-0 text-xs text-slate-600">
                      {entries.length} {entries.length === 1 ? 'sección' : 'secciones'}
                    </span>
                  </button>

                  {/* Chapter entries */}
                  {isExpanded && (
                    <div className="divide-y divide-white/5 border-t border-white/5">
                      {entries.map((item) => (
                        <BookEntry key={item.id} item={item} onDelete={deleteItem} />
                      ))}
                      <button
                        onClick={() => openModal('libro')}
                        className="flex w-full items-center gap-2 px-4 py-3 text-xs text-slate-600 hover:text-slate-400 hover:bg-white/3 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar sección a {chapterName}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function BookEntry({
  item,
  onDelete,
}: {
  item: Item
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const wordCount = item.content.split(/\s+/).filter(Boolean).length

  return (
    <div className="group px-4 py-3 hover:bg-white/2 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex-1 text-left"
        >
          <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
            {item.title}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-600">
            {wordCount} palabras · {formatDate(item.updatedAt)}
          </p>
        </button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {confirm ? (
            <>
              <button
                onClick={() => onDelete(item.id)}
                className="rounded px-2 py-1 bg-red-500/20 text-[10px] text-red-400 hover:bg-red-500/30"
              >
                Eliminar
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="rounded px-2 py-1 text-[10px] text-slate-500"
              >
                No
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              className="rounded p-1.5 text-slate-600 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <p className="mt-2 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap animate-slide-up">
          {item.content}
        </p>
      )}
    </div>
  )
}
