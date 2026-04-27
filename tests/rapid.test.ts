import { describe, expect, it } from 'vitest'
import { signRapidPayload, verifyRapidSignature } from '../src/lib/rapid'

describe('Rapid webhook signature verification', () => {
  it('accepts a valid HMAC signature', () => {
    const payload = JSON.stringify({ event: 'payment.paid', orderId: 'order-1' })
    const signature = signRapidPayload(payload, 'secret')

    expect(verifyRapidSignature(payload, signature, 'secret')).toBe(true)
    expect(verifyRapidSignature(payload, `sha256=${signature}`, 'secret')).toBe(true)
  })

  it('rejects an invalid signature', () => {
    const payload = JSON.stringify({ event: 'payment.paid', orderId: 'order-1' })

    expect(verifyRapidSignature(payload, '00', 'secret')).toBe(false)
  })
})
