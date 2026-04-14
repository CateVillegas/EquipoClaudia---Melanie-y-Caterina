'use client'

import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import IdeasView from '@/components/IdeasView'
import CalendarView from '@/components/CalendarView'
import AgentChat from '@/components/AgentChat'
import ProView from '@/components/ProView'
import NewItemModal from '@/components/NewItemModal'
import { X } from 'lucide-react'

export default function App() {
  const { activeView, setActiveView, modalOpen } = useStore()
  const panelOpen = activeView !== 'agente' && activeView !== 'pro'
  const isProView = activeView === 'pro'

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf9f6]">
      <Sidebar />

      <div className="flex flex-1 overflow-hidden">
        {isProView ? (
          /* Pro view — full screen, no chat split */
          <div className="relative flex-1 overflow-y-auto animate-fade-in">
            <button
              onClick={() => setActiveView('agente')}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-[#a09890] ring-1 ring-[#e9e3da] backdrop-blur-sm hover:bg-white hover:text-[#6b6259] transition-all"
              title="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <ProView />
          </div>
        ) : (
          <>
            {/* Chat — always visible */}
            <div
              className={cn(
                'flex flex-col transition-all duration-300 ease-in-out',
                panelOpen
                  ? 'w-[42%] min-w-[360px] border-r border-[#e9e3da]'
                  : 'flex-1'
              )}
            >
              <AgentChat compact={panelOpen} />
            </div>

            {/* Side panel — other views */}
            {panelOpen && (
              <div className="relative flex-1 overflow-y-auto animate-fade-in">
                {/* Close button */}
                <button
                  onClick={() => setActiveView('agente')}
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-[#a09890] ring-1 ring-[#e9e3da] backdrop-blur-sm hover:bg-white hover:text-[#6b6259] transition-all"
                  title="Cerrar panel"
                >
                  <X className="h-4 w-4" />
                </button>

                {activeView === 'dashboard' && <Dashboard />}
                {activeView === 'ideas' && <IdeasView />}
                {activeView === 'calendario' && <CalendarView />}
              </div>
            )}
          </>
        )}
      </div>

      {modalOpen && <NewItemModal />}
    </div>
  )
}
