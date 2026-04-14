'use client'

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
        <h1 className="text-xl font-semibold text-[#1c1815] tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-[#8c8279]">{subtitle}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 rounded-lg bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 ring-1 ring-violet-200 transition-all hover:bg-violet-100 hover:text-violet-800"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </button>
      )}
    </div>
  )
}
