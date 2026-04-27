import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { createManualMatch } from '../../lib/data'

const matchSchema = z.object({
  userA: z.string().min(1),
  userB: z.string().min(1),
  scheduledAt: z.string().min(1),
})

export const Route = createFileRoute('/api/matches')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const input = matchSchema.parse(await request.json())
          const result = await createManualMatch({
            ...input,
            scheduledAt: new Date(input.scheduledAt).toISOString(),
          })
          return Response.json({ ok: true, matchId: result.match.id, sessionId: result.session.id })
        } catch (error) {
          return Response.json(
            { ok: false, error: error instanceof Error ? error.message : 'Could not create match.' },
            { status: 400 },
          )
        }
      },
    },
  },
})
