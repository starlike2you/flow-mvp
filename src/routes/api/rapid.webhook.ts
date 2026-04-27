import { createFileRoute } from '@tanstack/react-router'
import { createUserFromRapid } from '../../lib/data'
import { type RapidWebhookPayload, verifyRapidSignature } from '../../lib/rapid'

export const Route = createFileRoute('/api/rapid/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = await request.text()
        const secret = process.env.RAPID_WEBHOOK_SECRET || 'dev-secret'
        const signature = request.headers.get('x-rapid-signature')

        if (!verifyRapidSignature(payload, signature, secret)) {
          return Response.json({ ok: false, error: 'Invalid Rapid signature.' }, { status: 401 })
        }

        const event = JSON.parse(payload) as RapidWebhookPayload

        if (event.event === 'payment.paid') {
          const user = createUserFromRapid({
            email: event.email,
            orderId: event.orderId,
            depositAmount: event.depositAmount,
          })
          return Response.json({ ok: true, userId: user.id })
        }

        return Response.json({ ok: true, ignored: event.event })
      },
    },
  },
})
