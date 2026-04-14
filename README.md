# Cerebro — Tu segunda mente

Sistema personal de gestión de ideas, proyectos, escritura y eventos, potenciado por un agente IA basado en Claude Opus 4.6.

---

## Qué incluye

| Sección | Descripción |
|---|---|
| **Dashboard** | Vista general: estadísticas, entradas fijadas, próximos eventos y actividad reciente |
| **Ideas & Proyectos** | Tarjetas filtrables por categoría con búsqueda, pin y etiquetas |
| **Libro** | Escritura organizada por capítulos con contador de palabras |
| **Calendario** | Vista mensual con puntos de evento, panel lateral de días seleccionados |
| **Agente IA** | Chat con Claude Opus 4.6, streaming en tiempo real, contexto completo de tus notas |

### Categorías

- 💡 **Idea** — Pensamientos y conceptos
- 📖 **Libro** — Secciones de escritura agrupadas por capítulo
- 📅 **Evento** — Fechas que aparecen en el calendario
- 🚀 **Proyecto** — Iniciativas con seguimiento
- 🌿 **Personal** — Notas de vida, hábitos, reflexiones

---

## Stack

- **Next.js 14** — App Router
- **TypeScript**
- **Tailwind CSS v3**
- **Zustand v4** — Estado global con persistencia en localStorage
- **@anthropic-ai/sdk** — Claude Opus 4.6 con adaptive thinking y streaming
- **date-fns v3** — Utilidades de fechas y generación del calendario
- **lucide-react** — Iconos

---

## Arquitectura

```
cerebro-app/
├── app/
│   ├── globals.css          # Fuente Inter, scrollbars, animaciones
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Router de vistas (SSR-safe)
│   └── api/
│       └── chat/
│           └── route.ts     # Endpoint de streaming con Anthropic SDK
├── components/
│   ├── Sidebar.tsx          # Navegación + contadores por categoría
│   ├── Header.tsx           # Header reutilizable con acción opcional
│   ├── Dashboard.tsx        # Vista principal con métricas
│   ├── IdeaCard.tsx         # Tarjeta de entrada (pin, delete, tags)
│   ├── IdeasView.tsx        # Grid de ideas/proyectos/personal con filtros
│   ├── LibroView.tsx        # Capítulos colapsables + estadísticas de escritura
│   ├── CalendarView.tsx     # Calendario mensual custom + panel de eventos
│   ├── AgentChat.tsx        # Chat con streaming SSE + quick prompts
│   └── NewItemModal.tsx     # Modal de creación con campos condicionales
└── lib/
    ├── types.ts             # Tipos TypeScript + CATEGORY_CONFIG
    ├── utils.ts             # cn(), formatDate(), getCalendarDays(), etc.
    └── store.ts             # Zustand store con persist middleware
```

### Flujo del agente IA

```
Cliente (AgentChat)
  → POST /api/chat  { messages, context }
      → Anthropic SDK stream()
          model: claude-opus-4-6
          thinking: { type: 'adaptive' }
          system: prompt + contexto del usuario (prompt caching)
  ← ReadableStream (text/event-stream)
      → delta de texto acumulado en tiempo real
```

El contexto que se envía al agente incluye automáticamente todas las entradas del usuario agrupadas por categoría.

---

## Requisitos

- Node.js 18+
- API key de Anthropic → [console.anthropic.com](https://console.anthropic.com)

---

## Instalación y uso

```bash
# 1. Clonar el repo
git clone <url-del-repo>
cd cerebro-app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env y poner tu API key:
# ANTHROPIC_API_KEY=sk-ant-...

# 4. Correr en desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Build para producción

```bash
npm run build
npm start
```

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | API key de Anthropic (requerida para el agente) |

Sin la API key la app funciona completa excepto el Agente IA, que mostrará un mensaje de error al intentar enviar mensajes.

---

## Persistencia de datos

Los datos se guardan en `localStorage` del navegador bajo la clave `cerebro-storage`. No hay base de datos — todo es local y privado. Para migrar datos entre dispositivos, exporta el valor de esa clave desde las DevTools del navegador.
