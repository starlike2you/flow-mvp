import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { upsertOnboarding } from '../../lib/data'

const onboardingSchema = z.object({
  email: z.email(),
  nickname: z.string().min(1),
  level: z.enum(['starter', 'elementary', 'intermediate', 'upper', 'advanced']),
  interests: z.array(z.string()).default([]),
  intro: z.string().default(''),
  photoUrl: z.string().optional(),
  availability: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        startHour: z.number().int().min(0).max(23),
        endHour: z.number().int().min(1).max(24),
      }),
    )
    .min(1),
})

export const Route = createFileRoute('/api/onboarding')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const input = onboardingSchema.parse(await request.json())
          const user = upsertOnboarding(input)
          return Response.json({ ok: true, userId: user.id, nickname: user.nickname })
        } catch (error) {
          return Response.json(
            { ok: false, error: error instanceof Error ? error.message : 'Invalid onboarding data.' },
            { status: 400 },
          )
        }
      },
    },
  },
})
