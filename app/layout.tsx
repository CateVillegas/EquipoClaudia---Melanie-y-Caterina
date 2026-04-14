import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cerebro — Tu segunda mente',
  description: 'Tu espacio personal para ideas, proyectos y recuerdos, potenciado por IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-[#faf9f6] text-[#1c1815] antialiased">
        {children}
      </body>
    </html>
  )
}
