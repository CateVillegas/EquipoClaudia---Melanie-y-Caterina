import dynamic from 'next/dynamic'

const App = dynamic(() => import('@/components/App'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        <p className="text-slate-500 text-sm">Cargando Cerebro…</p>
      </div>
    </div>
  ),
})

export default function Home() {
  return <App />
}
