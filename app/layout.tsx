import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cerebro — Tu segunda mente',
  description: 'Sistema de ideas, proyectos, libros y eventos potenciado por IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#0a0a0f] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
