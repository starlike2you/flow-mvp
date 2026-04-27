import { createHmac, timingSafeEqual } from 'node:crypto'

export function signRapidPayload(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export function verifyRapidSignature(payload: string, signature: string | null, secret: string) {
  if (!signature || !secret) return false

  const expected = signRapidPayload(payload, secret)
  const expectedBuffer = Buffer.from(expected, 'hex')
  const signatureBuffer = Buffer.from(signature.replace(/^sha256=/, ''), 'hex')

  if (expectedBuffer.length !== signatureBuffer.length) return false
  return timingSafeEqual(expectedBuffer, signatureBuffer)
}

export type RapidWebhookPayload = {
  event: 'payment.paid' | 'payment.refunded'
  orderId: string
  email: string
  depositAmount: number
}
