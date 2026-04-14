import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Eres Cerebro, un asistente de IA personal altamente inteligente y creativo. Tu rol es ayudar al usuario a pensar con mayor claridad, organizar sus ideas, desarrollar proyectos, y reflexionar sobre su vida.

Tienes acceso al contexto completo del usuario: sus ideas, proyectos, escritos de libro, eventos y notas personales.

Principios:
- Sé conciso pero profundo. Preferencia por respuestas directas y accionables.
- Conecta ideas del usuario entre sí cuando sea relevante.
- Usa bullet points y estructura cuando ayude a la claridad.
- Habla siempre en español, con un tono inteligente y cercano.
- Si el usuario comparte una idea, ayúdalo a desarrollarla, cuestionarla o expandirla.
- Para preguntas de libro, ayuda con estructura, estilo y desarrollo narrativo.
- Para eventos, ayuda a planificar y preparar.
- Para proyectos, piensa en visión, estrategia y pasos concretos.

Contexto del usuario:`

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurada' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\n${context}`
      : SYSTEM_PROMPT

    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      system: [
        {
          type: 'text',
          text: systemContent,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const chunk = JSON.stringify({ type: 'text', text: event.delta.text })
              controller.enqueue(encoder.encode(`data: ${chunk}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error desconocido'
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', text: msg })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
