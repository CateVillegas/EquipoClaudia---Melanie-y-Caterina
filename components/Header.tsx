'use client'

import { useStore } from '@/lib/store'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export default function Header({ title, subtitle, action, className }: HeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-6 py-6', className)}>
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 rounded-lg bg-violet-600/15 px-4 py-2 text-sm font-medium text-violet-400 ring-1 ring-violet-500/20 transition-all hover:bg-violet-600/25 hover:text-violet-300"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </button>
      )}
    </div>
  )
}
