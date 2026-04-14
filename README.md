# Cerebro — Tu segunda mente

Sistema personal de gestión de ideas, proyectos, personas y eventos, potenciado por un agente IA basado en Claude Opus 4.6 con tool use real.

---

## Qué incluye

| Sección | Descripción |
|---|---|
| **Agente IA** | Chat principal. Ejecuta acciones reales: crea, edita, borra y navega entre pantallas |
| **Dashboard** | Vista general: estadísticas, entradas fijadas, próximos eventos y actividad reciente |
| **Ideas & Proyectos** | Tarjetas filtrables por categoría con búsqueda, pin y etiquetas |
| **Calendario** | Vista mensual con eventos únicos y recurrentes, panel lateral por día |

### Categorías

- 💡 **Idea** — Pensamientos y conceptos
- 📅 **Evento** — Fechas que aparecen en el calendario
- 🚀 **Proyecto** — Iniciativas con seguimiento
- 🌿 **Personal** — Notas de vida, hábitos, reflexiones
- 👤 **Persona** — Todo lo vinculado a alguien: recordatorios, turnos, medicamentos, notas

El agente puede proponer y crear categorías nuevas cuando el contenido no encaja en las existentes.

---

## Stack

- **Next.js 14** — App Router
- **TypeScript**
- **Tailwind CSS v3**
- **Zustand v4** — Estado global con persistencia en localStorage
- **@anthropic-ai/sdk** — Claude Opus 4.6 con tool use y streaming SSE
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
│           └── route.ts     # Agentic loop con Anthropic SDK + SSE
├── components/
│   ├── App.tsx              # Layout split-screen: sidebar + chat + panel lateral
│   ├── Sidebar.tsx          # Navegación con íconos
│   ├── Dashboard.tsx        # Vista principal con métricas
│   ├── IdeaCard.tsx         # Tarjeta de entrada (pin, delete, tags, persona)
│   ├── IdeasView.tsx        # Grid de ideas/proyectos/personal con filtros
│   ├── CalendarView.tsx     # Calendario mensual custom + expansión de recurrentes
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
  → POST /api/chat  { messages, items, categories, activeView }
      → Agentic loop (hasta 6 iteraciones)
          model: claude-opus-4-6
          tools: create_item, update_item, delete_item,
                 list_items, create_category, navigate_app
          system: prompt base + contexto completo del usuario
  ← ReadableStream (text/event-stream)
      data: { type: "text", text: "..." }         → streaming de respuesta
      data: { type: "tool_call", name, summary }  → acción en curso
      data: { type: "mutation", action, item }    → CRUD aplicado al store
      data: { type: "done" }
```

El agente ejecuta las herramientas server-side y emite eventos `mutation` que el cliente aplica directamente al store de Zustand — sin recarga, sin confirmación manual.

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

Los datos se guardan en `localStorage` del navegador bajo la clave `cerebro-storage`. No hay base de datos — todo es local y privado. Para migrar datos entre dispositivos, exportá el valor de esa clave desde las DevTools del navegador.

---

## Casos de uso

Estos son prompts reales para pegar en el chat del Agente. Muestran el rango de lo que Cerebro puede interpretar y ejecutar.

### Personas y cuidados

**Recordatorio de medicación recurrente**
```
Necesito recordar darle los medicamentos a mi abuelo Juan todos los viernes a las 10:00hs am durante 1 mes. El medicamento se llama Enalapril 10mg. Guardalo vinculado a Juan.
```
→ Crea un ítem en `persona` con `personName: "Juan"`, recurrencia semanal y fecha de fin a 1 mes. Pregunta si agregarlo al calendario.

---

**Turno médico puntual**
```
Hoy a las 18hs tengo que acordarme de sacarle turno al Médico Clínico a mi abuelo Juan. Guardalo con Juan para no olvidarlo.
```
→ Crea un ítem en `persona` con fecha de hoy, sin recurrencia. Pregunta si lo agrega al calendario.

---

**Guardar info de una persona**
```
Agregá a mi amiga Sofía. Tiene 32 años, es diseñadora UX y su cumpleaños es el 15 de agosto. Guardá también que le gusta el café con leche sin azúcar, por si algún día la invito.
```
→ Crea un ítem en `persona` con el perfil completo de Sofía. Pregunta si el cumpleaños va al calendario.

---

### Ideas y proyectos

**Capturar una idea rápida**
```
Tuve una idea: una app que te recomienda qué cocinar según los ingredientes que tenés en la heladera, con modo "nevera vacía" para los domingos. Guardala como idea antes de que se me olvide.
```
→ Crea un ítem en `idea` con el concepto completo.

---

**Crear un proyecto con contexto**
```
Quiero arrancar el proyecto de rediseño de mi portfolio. Tengo que actualizar los casos de estudio, cambiar la paleta de colores y agregar una sección de blog. El objetivo es tenerlo listo antes de fin de mes para empezar a mandar CVs.
```
→ Crea un ítem en `proyecto` con el detalle y los objetivos.

---

**Priorizar lo pendiente**
```
Revisá todo lo que tengo guardado y decime qué debería hacer primero hoy.
```
→ Lista los ítems, analiza fechas y prioridades, y sugiere un orden de acción.

---

### Eventos y calendario

**Agendar un evento**
```
El miércoles 23 tengo cena con el equipo a las 21hs en Lo de Marcos. Guardalo en el calendario.
```
→ Crea un ítem en `evento` con fecha y detalle.

---

**Evento recurrente**
```
Todos los lunes a las 8am tengo stand-up con el equipo. Es indefinido, no tiene fecha de fin.
```
→ Crea un ítem en `evento` con recurrencia semanal sin `endDate`.

---

### Organización y navegación

**Abrir el dashboard**
```
Abrí el dashboard para ver un resumen de todo.
```
→ Ejecuta `navigate_app` y abre el panel del Dashboard.

**Crear una categoría nueva**
```
Quiero una categoría para guardar recetas de cocina. Poné un emoji que tenga sentido.
```
→ Ejecuta `create_category` con key `recetas`, label y emoji 🍳.

---

**Modificar una entrada existente**
```
El proyecto de portfolio que guardé antes, cambiá la prioridad: ahora el foco es solo la sección blog, lo demás puede esperar.
```
→ Busca el ítem con `list_items`, ejecuta `update_item` con el contenido actualizado.

---

**Borrar algo**
```
Borrá el recordatorio del Enalapril de Juan, ya no lo necesita más.
```
→ Busca el ítem, ejecuta `delete_item`.
