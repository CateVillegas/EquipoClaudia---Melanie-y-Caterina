'use client'

import { useStore } from '@/lib/store'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import IdeasView from '@/components/IdeasView'
import CalendarView from '@/components/CalendarView'
import AgentChat from '@/components/AgentChat'
import ProView from '@/components/ProView'
import NewItemModal from '@/components/NewItemModal'

export default function App() {
  const { activeView, modalOpen } = useStore()

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf9f6]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        {activeView === 'agente' && <AgentChat />}
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'ideas' && <IdeasView />}
        {activeView === 'calendario' && <CalendarView />}
        {activeView === 'pro' && <ProView />}
      </div>

      {modalOpen && <NewItemModal />}
    </div>
  )
}
