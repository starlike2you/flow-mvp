import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { askAiTeacher } from '../../lib/ai'
import { recordAiMessage } from '../../lib/data'

const aiSchema = z.object({
  sessionId: z.string().min(1),
  userId: z.string().min(1),
  prompt: z.string().min(1),
  context: z.string().default(''),
})

export const Route = createFileRoute('/api/ai')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const input = aiSchema.parse(await request.json())
          const response = await askAiTeacher(input.prompt, input.context)
          recordAiMessage({ ...input, response })
          return Response.json({ ok: true, response })
        } catch (error) {
          return Response.json(
            { ok: false, error: error instanceof Error ? error.message : 'AI teacher failed.' },
            { status: 400 },
          )
        }
      },
    },
  },
})
