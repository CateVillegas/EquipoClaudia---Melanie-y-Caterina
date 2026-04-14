'use client'

import {
  Crown,
  Cloud,
  FileSpreadsheet,
  MessageCircle,
  Brain,
  Zap,
  Lock,
  Sparkles,
  RefreshCw,
  BellRing,
  Globe,
} from 'lucide-react'

const INTEGRATIONS = [
  {
    icon: Cloud,
    name: 'iCloud Notes',
    description: 'Sincroniza tus notas de Apple automáticamente. Cerebro lee y organiza todo por vos.',
    color: 'bg-sky-50 text-sky-600 ring-sky-200',
  },
  {
    icon: FileSpreadsheet,
    name: 'Google Sheets',
    description: 'Conecta tus hojas de cálculo. Ideas, presupuestos y datos importados al instante.',
    color: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  },
  {
    icon: MessageCircle,
    name: 'WhatsApp',
    description: 'Enviá mensajes a Cerebro por WhatsApp y todo se guarda automáticamente.',
    color: 'bg-green-50 text-green-600 ring-green-200',
  },
  {
    icon: Globe,
    name: 'Notion',
    description: 'Importa páginas y bases de datos de Notion directamente a tu cerebro.',
    color: 'bg-gray-50 text-gray-600 ring-gray-200',
  },
]

const PRO_FEATURES = [
  {
    icon: RefreshCw,
    title: 'Memoria autónoma',
    description: 'El agente aprende en background de todas tus fuentes conectadas, sin que tengas que hacer nada.',
  },
  {
    icon: BellRing,
    title: 'Recordatorios inteligentes',
    description: 'Cerebro detecta patrones y te avisa antes de que se te pase algo importante.',
  },
  {
    icon: Zap,
    title: 'Acciones automáticas',
    description: 'Crea reglas: "si llega un mail de X, guardá el adjunto en Y". El agente ejecuta por vos.',
  },
  {
    icon: Brain,
    title: 'Contexto infinito',
    description: 'Sin límite de entradas ni historial. Tu segundo cerebro crece con vos sin techo.',
  },
]

export default function ProView() {
  return (
    <div className="h-full overflow-y-auto bg-[#faf9f6]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/60 via-amber-50/40 to-transparent" />
        <div className="relative mx-auto max-w-2xl px-6 pb-10 pt-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 ring-1 ring-violet-200">
            <Crown className="h-4 w-4 text-violet-600" />
            <span className="text-xs font-semibold text-violet-700">Cerebro Pro</span>
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-[#1c1815]">
            Tu cerebro,<br />en piloto automático
          </h1>
          <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-[#6b6259]">
            Hoy usás Cerebro con participación activa — vos le contás las cosas al chat.
            Con <strong>Pro</strong>, el agente se conecta a tus apps y recuerda todo <em>solo</em>,
            en background, de forma autónoma.
          </p>

          {/* Price card */}
          <div className="mx-auto mb-8 max-w-xs rounded-2xl border border-violet-200 bg-white p-6 shadow-lg shadow-violet-100/50">
            <div className="mb-1 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-[#1c1815]">$20</span>
              <span className="text-sm text-[#a09890]">USD / mes</span>
            </div>
            <p className="mb-5 text-xs text-[#a09890]">Cancelas cuando quieras</p>

            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6d5fd3] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#5e50c4] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Lock className="h-4 w-4" />
              Próximamente
            </button>
            <p className="mt-3 text-[10px] text-[#bfb9b2]">
              Estamos construyendo esto — unite a la lista de espera.
            </p>
          </div>
        </div>
      </div>

      {/* How it changes */}
      <div className="mx-auto max-w-2xl px-6 pb-10">
        <div className="mb-8 rounded-2xl border border-[#e9e3da] bg-white p-6">
          <h3 className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-[#a09890]">
            La diferencia
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#f4f1ec] p-4">
              <p className="mb-2 text-xs font-semibold text-[#6b6259]">Hoy (Free)</p>
              <p className="text-sm text-[#3d3630]">
                Vos le contás todo al agente por chat. Tu participación activa es necesaria para que recuerde.
              </p>
            </div>
            <div className="rounded-xl bg-violet-50 p-4 ring-1 ring-violet-200">
              <div className="mb-2 flex items-center gap-1.5">
                <p className="text-xs font-semibold text-violet-700">Pro</p>
                <Sparkles className="h-3 w-3 text-violet-500" />
              </div>
              <p className="text-sm text-[#3d3630]">
                El agente se conecta a tus apps y aprende en background. Recuerda cosas de forma automática y autónoma.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="mx-auto max-w-2xl px-6 pb-10">
        <h2 className="mb-1.5 text-center text-lg font-semibold text-[#1c1815]">
          Conectá todas tus fuentes
        </h2>
        <p className="mb-6 text-center text-sm text-[#a09890]">
          Cerebro Pro se integra con las apps que ya usás
        </p>
        <div className="grid grid-cols-2 gap-3">
          {INTEGRATIONS.map(({ icon: Icon, name, description, color }) => (
            <div
              key={name}
              className="group rounded-xl border border-[#e9e3da] bg-white p-4 transition-all hover:border-violet-200 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm font-semibold text-[#1c1815]">{name}</span>
              </div>
              <p className="text-xs leading-relaxed text-[#6b6259]">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pro features */}
      <div className="mx-auto max-w-2xl px-6 pb-12">
        <h2 className="mb-1.5 text-center text-lg font-semibold text-[#1c1815]">
          Qué desbloquea Pro
        </h2>
        <p className="mb-6 text-center text-sm text-[#a09890]">
          Automatización real para tu segundo cerebro
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PRO_FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-[#e9e3da] bg-white p-4 transition-all hover:border-violet-200"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 ring-1 ring-violet-200">
                <Icon className="h-4 w-4 text-violet-600" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-[#1c1815]">{title}</h3>
              <p className="text-xs leading-relaxed text-[#6b6259]">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mx-auto max-w-2xl px-6 pb-12">
        <div className="rounded-2xl bg-gradient-to-r from-violet-100 to-amber-50 p-6 text-center ring-1 ring-violet-200/50">
          <p className="mb-1 text-sm font-semibold text-[#1c1815]">
            Hacia donde escala Cerebro
          </p>
          <p className="mx-auto mb-4 max-w-sm text-xs leading-relaxed text-[#6b6259]">
            La visión es que nunca más pierdas una idea, un contacto o una fecha.
            Cerebro escucha tus fuentes, conecta los puntos y te recuerda lo que importa — sin que hagas nada.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-violet-600">
            <Sparkles className="h-3.5 w-3.5" />
            En desarrollo — próximamente
          </div>
        </div>
      </div>
    </div>
  )
}
