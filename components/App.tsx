'use client'

import { useStore } from '@/lib/store'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import IdeasView from '@/components/IdeasView'
import LibroView from '@/components/LibroView'
import CalendarView from '@/components/CalendarView'
import AgentChat from '@/components/AgentChat'
import NewItemModal from '@/components/NewItemModal'

export default function App() {
  const { activeView, modalOpen } = useStore()

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
