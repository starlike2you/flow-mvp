import type { Availability, FlowUser, Match } from './types'

export function shareAvailability(
  userA: FlowUser,
  userB: FlowUser,
  availability: Availability[],
) {
  const slotsA = availability.filter((slot) => slot.userId === userA.id)
  const slotsB = availability.filter((slot) => slot.userId === userB.id)

  return slotsA.some((a) =>
    slotsB.some(
      (b) =>
        a.weekday === b.weekday &&
        Math.max(a.startHour, b.startHour) < Math.min(a.endHour, b.endHour),
    ),
  )
}

export function canMatchUsers(
  userA: FlowUser,
  userB: FlowUser,
  availability: Availability[],
  matches: Match[],
) {
  if (userA.id === userB.id) return false

  const levelGap = Math.abs(levelRank(userA.level) - levelRank(userB.level))
  const alreadyActive = matches.some(
    (match) =>
      match.status === 'scheduled' &&
      [match.userA, match.userB].includes(userA.id) &&
      [match.userA, match.userB].includes(userB.id),
  )

  return levelGap <= 1 && !alreadyActive && shareAvailability(userA, userB, availability)
}

function levelRank(level: FlowUser['level']) {
  const ranks: Record<FlowUser['level'], number> = {
    starter: 1,
    elementary: 2,
    intermediate: 3,
    upper: 4,
    advanced: 5,
  }

  return ranks[level]
}
