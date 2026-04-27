import { describe, expect, it } from 'vitest'
import { canMatchUsers } from '../src/lib/matching'
import type { Availability, FlowUser, Match } from '../src/lib/types'

const baseUser: FlowUser = {
  id: 'a',
  email: 'a@example.com',
  nickname: 'A',
  level: 'intermediate',
  interests: [],
  intro: '',
  createdAt: '2026-04-25T00:00:00.000Z',
}

describe('manual matching eligibility', () => {
  it('requires similar level and overlapping availability', () => {
    const userB: FlowUser = { ...baseUser, id: 'b', email: 'b@example.com', nickname: 'B' }
    const availability: Availability[] = [
      { userId: 'a', weekday: 1, startHour: 20, endHour: 22 },
      { userId: 'b', weekday: 1, startHour: 21, endHour: 23 },
    ]

    expect(canMatchUsers(baseUser, userB, availability, [])).toBe(true)
  })

  it('rejects an already scheduled pair', () => {
    const userB: FlowUser = { ...baseUser, id: 'b', email: 'b@example.com', nickname: 'B' }
    const availability: Availability[] = [
      { userId: 'a', weekday: 1, startHour: 20, endHour: 22 },
      { userId: 'b', weekday: 1, startHour: 21, endHour: 23 },
    ]
    const matches: Match[] = [
      {
        id: 'match-1',
        userA: 'a',
        userB: 'b',
        scheduledAt: '2026-04-27T12:00:00.000Z',
        status: 'scheduled',
        dailyRoomUrl: 'https://flow.daily.co/dev',
      },
    ]

    expect(canMatchUsers(baseUser, userB, availability, matches)).toBe(false)
  })
})
