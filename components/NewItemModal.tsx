'use client'

import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import { useT } from '@/lib/i18n'
import {
  Category,
  DEFAULT_CATEGORIES,
  getCategoryConfig,
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { X, Plus } from 'lucide-react'

export default function NewItemModal() {
  const { closeModal, modalCategory, addItem, categories } = useStore()
  const t = useT()

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
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag])
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
          <h2 className="text-base font-semibold text-[#1c1815]">{t.modal.title}</h2>
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
            <label className="mb-2 block text-xs font-medium text-[#8c8279]">{t.modal.category}</label>
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
                {t.modal.personName}
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder={t.modal.personPlaceholder}
                className="w-full rounded-lg border border-[#e9e3da] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#1c1815] placeholder-[#bfb9b2] outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-100 transition-all"
              />
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-[#8c8279]">{t.modal.titleLabel}</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.modal.placeholder(category)}
              className="w-full rounded-lg border border-[#e9e3da] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#1c1815] placeholder-[#bfb9b2] outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-100 transition-all"
              required
            />
          </div>

          {/* Date */}
          {isEventLike && (
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-[#8c8279]">
                {t.modal.dateLabel(category === 'persona')}
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
                {t.modal.repetition}
              </label>
              <div className="flex gap-2">
                <select
                  value={recurrenceFreq}
                  onChange={(e) => setRecurrenceFreq(e.target.value)}
                  className="flex-1 rounded-lg border border-[#e9e3da] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#1c1815] outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100 transition-all"
                >
                  {t.modal.recurrenceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {recurrenceFreq && (
                  <input
                    type="date"
                    value={recurrenceEnd}
                    onChange={(e) => setRecurrenceEnd(e.target.value)}
                    className="flex-1 rounded-lg border border-[#e9e3da] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#1c1815] outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100 transition-all"
                  />
                )}
              </div>
              {recurrenceFreq && (
                <p className="mt-1 text-[10px] text-[#a09890]">
                  {recurrenceEnd ? t.modal.repeatsUntil(recurrenceEnd) : t.modal.repeatsIndefinitely}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-[#8c8279]">{t.modal.content}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.modal.contentPlaceholder}
              rows={3}
              className="w-full resize-none rounded-lg border border-[#e9e3da] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#1c1815] placeholder-[#bfb9b2] outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-100 transition-all"
            />
          </div>

          {/* Tags */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-medium text-[#8c8279]">{t.modal.tags}</label>
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
                placeholder={tags.length === 0 ? t.modal.addTag : ''}
                className="flex-1 min-w-[80px] bg-transparent text-sm text-[#1c1815] placeholder-[#bfb9b2] outline-none"
              />
            </div>
            <p className="mt-1 text-[10px] text-[#bfb9b2]">{t.modal.enterToAdd}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg px-4 py-2 text-sm text-[#8c8279] hover:bg-[#f4f1ec] hover:text-[#3d3630] transition-colors"
            >
              {t.modal.cancel}
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
              {t.modal.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
