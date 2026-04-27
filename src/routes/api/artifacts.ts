import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { generateSessionArtifacts } from '../../lib/data'

const artifactSchema = z.object({
  sessionId: z.string().min(1),
  transcript: z.string().default(''),
})

export const Route = createFileRoute('/api/artifacts')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const input = artifactSchema.parse(await request.json())
          const artifacts = await generateSessionArtifacts(input.sessionId, input.transcript)
          return Response.json({ ok: true, ...artifacts })
        } catch (error) {
          return Response.json(
            { ok: false, error: error instanceof Error ? error.message : 'Could not generate artifacts.' },
            { status: 400 },
          )
        }
      },
    },
  },
})
