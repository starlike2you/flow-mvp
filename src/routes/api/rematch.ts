import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { markMatchForRematch } from '../../lib/data'

export const Route = createFileRoute('/api/rematch')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const input = z.object({ matchId: z.string().min(1) }).parse(await request.json())
          const match = markMatchForRematch(input.matchId)
          return Response.json({ ok: true, match })
        } catch (error) {
          return Response.json(
            { ok: false, error: error instanceof Error ? error.message : 'Could not queue rematch.' },
            { status: 400 },
          )
        }
      },
    },
  },
})
