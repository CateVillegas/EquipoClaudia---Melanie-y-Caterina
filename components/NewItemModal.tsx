'use client'

import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import { CATEGORY_CONFIG, Category } from '@/lib/types'
import { cn } from '@/lib/utils'
import { X, Plus } from 'lucide-react'

const CATEGORIES: Category[] = ['idea', 'libro', 'evento', 'proyecto', 'personal']

export default function NewItemModal() {
  const { closeModal, modalCategory, addItem } = useStore()
  const [category, setCategory] = useState<Category>(modalCategory ?? 'idea')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState('')
  const [chapter, setChapter] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  useEffect(() => {
    if (modalCategory) setCategory(modalCategory)
  }, [modalCategory])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    addItem({
      title: title.trim(),
      content: content.trim(),
      category,
      date: category === 'evento' ? date || undefined : undefined,
      chapter: category === 'libro' ? chapter.trim() || undefined : undefined,
      tags: tags.length > 0 ? tags : undefined,
      pinned: false,
    })

    closeModal()
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const cfg = CATEGORY_CONFIG[category]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-slide-up rounded-2xl border border-white/10 bg-[#111118] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h2 className="text-base font-semibold text-white">Nueva entrada</h2>
          <button
            onClick={closeModal}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {/* Category selector */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-slate-500">
              Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const c = CATEGORY_CONFIG[cat]
                const isActive = category === cat
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                      isActive
                        ? cn(c.bg, c.text, 'ring-1', c.border)
                        : 'bg-white/5 text-slate-500 hover:bg-white/8 hover:text-slate-300'
                    )}
                  >
                    {c.emoji} {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Título *
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === 'idea'
                  ? 'Mi idea brillante…'
                  : category === 'libro'
                  ? 'Título de la sección…'
                  : category === 'evento'
                  ? 'Nombre del evento…'
                  : category === 'proyecto'
                  ? 'Nombre del proyecto…'
                  : 'Título…'
              }
              className="w-full rounded-lg border border-white/5 bg-[#0d0d14] px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
              required
            />
          </div>

          {/* Conditional: Chapter (libro) */}
          {category === 'libro' && (
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Capítulo
              </label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="Ej: Capítulo 1, Prólogo, Epílogo…"
                className="w-full rounded-lg border border-white/5 bg-[#0d0d14] px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}

          {/* Conditional: Date (evento) */}
          {category === 'evento' && (
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Fecha del evento
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-white/5 bg-[#0d0d14] px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all [color-scheme:dark]"
              />
            </div>
          )}

          {/* Content */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Contenido
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Desarrolla tu pensamiento aquí…"
              rows={4}
              className="w-full resize-none rounded-lg border border-white/5 bg-[#0d0d14] px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>

          {/* Tags */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Etiquetas
            </label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/5 bg-[#0d0d14] px-3 py-2 focus-within:border-violet-500/40 transition-all min-h-[42px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-md bg-violet-500/15 px-2 py-0.5 text-xs text-violet-400"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-violet-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? 'Añadir etiqueta…' : ''}
                className="flex-1 min-w-[80px] bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-700">
              Presiona Enter para agregar una etiqueta
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all',
                title.trim()
                  ? cn('text-white', cfg.bg.replace('/10', '/80'), 'hover:opacity-90')
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
              )}
            >
              <Plus className="h-4 w-4" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
