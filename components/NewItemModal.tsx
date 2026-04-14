'use client'

import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import {
  Category,
  DEFAULT_CATEGORIES,
  getCategoryConfig,
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { X, Plus } from 'lucide-react'

const RECURRENCE_OPTIONS = [
  { value: '', label: 'Sin repetición' },
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
]

export default function NewItemModal() {
  const { closeModal, modalCategory, addItem, categories } = useStore()
  const categoryOptions = [
    ...DEFAULT_CATEGORIES.map((c) => c.key),
    ...categories
      .map((c) => c.key)
      .filter((key) => !DEFAULT_CATEGORIES.some((base) => base.key === key))
      .sort((a, b) => a.localeCompare(b)),
  ]

  const [category, setCategory] = useState<Category>(modalCategory ?? 'idea')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState('')
  const [personName, setPersonName] = useState('')
  const [recurrenceFreq, setRecurrenceFreq] = useState('')
  const [recurrenceEnd, setRecurrenceEnd] = useState('')
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
      date: (category === 'evento' || category === 'persona') ? date || undefined : undefined,
      personName: category === 'persona' ? personName.trim() || undefined : undefined,
      recurrence: recurrenceFreq
        ? {
            frequency: recurrenceFreq as 'daily' | 'weekly' | 'monthly',
            endDate: recurrenceEnd || undefined,
          }
        : undefined,
      tags: tags.length > 0 ? tags : undefined,
      pinned: false,
    })

    closeModal()
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag() }
    else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const isEventLike = category === 'evento' || category === 'persona'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg animate-slide-up rounded-2xl border border-[#e9e3da] bg-white shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f4f1ec] px-5 py-4">
          <h2 className="text-base font-semibold text-[#1c1815]">Nueva entrada</h2>
          <button
            onClick={closeModal}
            className="rounded-lg p-1.5 text-[#a09890] hover:bg-[#f4f1ec] hover:text-[#6b6259] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {/* Category selector */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-[#8c8279]">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => {
                const c = getCategoryConfig(cat, categories)
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
                        : 'bg-[#f4f1ec] text-[#8c8279] hover:text-[#3d3630]'
                    )}
                  >
                    {c.emoji} {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Person name (for persona category) */}
          {category === 'persona' && (
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-[#8c8279]">
                Nombre de la persona
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Ej: Abuelo, Mamá, Juan…"
                className="w-full rounded-lg border border-[#e9e3da] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#1c1815] placeholder-[#bfb9b2] outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-100 transition-all"
              />
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-[#8c8279]">Título *</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === 'idea' ? 'Mi próxima gran idea…' :
                category === 'evento' ? 'Nombre del evento…' :
                category === 'proyecto' ? 'Nombre del proyecto…' :
                category === 'persona' ? 'Ej: Medicamentos del abuelo…' :
                'Algo que quiero recordar…'
              }
              className="w-full rounded-lg border border-[#e9e3da] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#1c1815] placeholder-[#bfb9b2] outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-100 transition-all"
              required
            />
          </div>

          {/* Date */}
          {isEventLike && (
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-[#8c8279]">
                {category === 'persona' ? 'Fecha de inicio' : 'Fecha del evento'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-[#e9e3da] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#1c1815] outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100 transition-all"
              />
            </div>
          )}

          {/* Recurrence */}
          {isEventLike && (
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-[#8c8279]">
                Repetición
              </label>
              <div className="flex gap-2">
                <select
                  value={recurrenceFreq}
                  onChange={(e) => setRecurrenceFreq(e.target.value)}
                  className="flex-1 rounded-lg border border-[#e9e3da] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#1c1815] outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100 transition-all"
                >
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {recurrenceFreq && (
                  <input
                    type="date"
                    value={recurrenceEnd}
                    onChange={(e) => setRecurrenceEnd(e.target.value)}
                    placeholder="Fecha de fin (opcional)"
                    className="flex-1 rounded-lg border border-[#e9e3da] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#1c1815] outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100 transition-all"
                  />
                )}
              </div>
              {recurrenceFreq && (
                <p className="mt-1 text-[10px] text-[#a09890]">
                  {recurrenceEnd ? `Se repite hasta el ${recurrenceEnd}` : 'Se repite indefinidamente'}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-[#8c8279]">Contenido</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Desarrollá tu pensamiento aquí…"
              rows={3}
              className="w-full resize-none rounded-lg border border-[#e9e3da] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#1c1815] placeholder-[#bfb9b2] outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-100 transition-all"
            />
          </div>

          {/* Tags */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-medium text-[#8c8279]">Etiquetas</label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#e9e3da] bg-[#faf9f6] px-3 py-2 focus-within:border-violet-300 transition-all min-h-[42px]">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-violet-900">
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
                className="flex-1 min-w-[80px] bg-transparent text-sm text-[#1c1815] placeholder-[#bfb9b2] outline-none"
              />
            </div>
            <p className="mt-1 text-[10px] text-[#bfb9b2]">Presioná Enter para agregar</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg px-4 py-2 text-sm text-[#8c8279] hover:bg-[#f4f1ec] hover:text-[#3d3630] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all',
                title.trim()
                  ? 'bg-[#6d5fd3] text-white hover:bg-[#5e50c4] shadow-sm'
                  : 'bg-[#f4f1ec] text-[#bfb9b2] cursor-not-allowed'
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
