'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import IdeasView from '@/components/IdeasView'
import LibroView from '@/components/LibroView'
import CalendarView from '@/components/CalendarView'
import AgentChat from '@/components/AgentChat'
import NewItemModal from '@/components/NewItemModal'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { activeView, modalOpen } = useStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p className="text-slate-500 text-sm">Cargando Cerebro…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'ideas' && <IdeasView />}
        {activeView === 'libro' && <LibroView />}
        {activeView === 'calendario' && <CalendarView />}
        {activeView === 'agente' && <AgentChat />}
      </main>
      {modalOpen && <NewItemModal />}
    </div>
  )
}
