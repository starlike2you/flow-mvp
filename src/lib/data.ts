import { createAudiobookScript, synthesizeAudiobook } from './audiobook'
import { createDailyRoom } from './daily'
import { canMatchUsers } from './matching'
import { createStudyNoteFromTranscript } from './notes'
import { enqueueNotification } from './notifications'
import type {
  AiMessage,
  Audiobook,
  Availability,
  FlowSnapshot,
  FlowUser,
  Match,
  Payment,
  Session,
  StudyNote,
  UserRoleRecord,
  WeeklyContent,
} from './types'

const now = new Date('2026-04-25T00:00:00.000Z').toISOString()

const users: FlowUser[] = [
  {
    id: 'user-juyeon',
    email: 'juyeon@example.com',
    nickname: 'Juyeon',
    level: 'intermediate',
    interests: ['marketing', 'career', 'travel'],
    intro: 'I want to speak in meetings without freezing.',
    createdAt: now,
  },
  {
    id: 'user-mina',
    email: 'mina@example.com',
    nickname: 'Mina',
    level: 'intermediate',
    interests: ['startup', 'movies', 'career'],
    intro: 'I can read English well, but speaking is scary.',
    createdAt: now,
  },
  {
    id: 'user-admin',
    email: 'admin@flow.test',
    nickname: 'Flow Ops',
    level: 'advanced',
    interests: ['operations'],
    intro: 'Flow 1기 operator account.',
    createdAt: now,
  },
]

const roles: UserRoleRecord[] = [
  { userId: 'user-juyeon', role: 'member' },
  { userId: 'user-mina', role: 'member' },
  { userId: 'user-admin', role: 'admin' },
]

const availability: Availability[] = [
  { userId: 'user-juyeon', weekday: 1, startHour: 20, endHour: 23 },
  { userId: 'user-juyeon', weekday: 3, startHour: 20, endHour: 22 },
  { userId: 'user-mina', weekday: 1, startHour: 21, endHour: 23 },
  { userId: 'user-mina', weekday: 4, startHour: 19, endHour: 22 },
]

const payments: Payment[] = [
  {
    id: 'pay-juyeon',
    userId: 'user-juyeon',
    rapidOrderId: 'rapid-seed-001',
    status: 'paid',
    depositAmount: 50000,
  },
  {
    id: 'pay-mina',
    userId: 'user-mina',
    rapidOrderId: 'rapid-seed-002',
    status: 'paid',
    depositAmount: 50000,
  },
]

const weeklyContents: WeeklyContent[] = [
  {
    id: 'week-1',
    weekNo: 1,
    title: 'Small Talk Without Fear',
    contentMd:
      'This week is about starting light conversations and keeping them moving with follow-up questions.',
    questions: [
      'What is one small habit that improved your week?',
      'When do you feel most confident speaking English?',
      'What kind of small talk feels natural to you?',
    ],
  },
]

const matches: Match[] = []
const sessions: Session[] = []
const aiMessages: AiMessage[] = []
const studyNotes: StudyNote[] = []
const audiobooks: Audiobook[] = []

export function getFlowSnapshot(): FlowSnapshot {
  return {
    users,
    roles,
    availability,
    payments,
    weeklyContents,
    matches,
    sessions,
    aiMessages,
    studyNotes,
    audiobooks,
  }
}

export function upsertOnboarding(input: {
  userId?: string
  email: string
  nickname: string
  level: FlowUser['level']
  interests: string[]
  intro: string
  photoUrl?: string
  availability: Array<{ weekday: number; startHour: number; endHour: number }>
}) {
  const id = input.userId || `user-${slugify(input.nickname || input.email)}`
  const existing = users.find((user) => user.id === id || user.email === input.email)
  const user: FlowUser = {
    id: existing?.id || id,
    email: input.email,
    nickname: input.nickname,
    level: input.level,
    interests: input.interests,
    intro: input.intro,
    photoUrl: input.photoUrl,
    createdAt: existing?.createdAt || new Date().toISOString(),
  }

  if (existing) {
    Object.assign(existing, user)
  } else {
    users.push(user)
    roles.push({ userId: user.id, role: 'member' })
    payments.push({
      id: `pay-${user.id}`,
      userId: user.id,
      rapidOrderId: `rapid-dev-${Date.now()}`,
      status: 'paid',
      depositAmount: 50000,
    })
  }

  for (let index = availability.length - 1; index >= 0; index -= 1) {
    if (availability[index]?.userId === user.id) availability.splice(index, 1)
  }

  availability.push(
    ...input.availability.map((slot) => ({
      userId: user.id,
      weekday: slot.weekday,
      startHour: slot.startHour,
      endHour: slot.endHour,
    })),
  )

  return user
}

export async function createManualMatch(input: {
  userA: string
  userB: string
  scheduledAt: string
}) {
  const userA = users.find((user) => user.id === input.userA)
  const userB = users.find((user) => user.id === input.userB)

  if (!userA || !userB) {
    throw new Error('Both users are required to create a match.')
  }

  if (!canMatchUsers(userA, userB, availability, matches)) {
    throw new Error('Users must have similar levels, no active pair, and overlapping availability.')
  }

  const matchId = `match-${Date.now()}`
  const room = await createDailyRoom({ matchId, scheduledAt: input.scheduledAt })
  const match: Match = {
    id: matchId,
    userA: userA.id,
    userB: userB.id,
    scheduledAt: input.scheduledAt,
    status: 'scheduled',
    dailyRoomUrl: room.url,
  }
  const session: Session = {
    id: `session-${Date.now()}`,
    matchId,
    status: 'scheduled',
  }

  matches.push(match)
  sessions.push(session)

  await Promise.all(
    [userA, userB].map((user) =>
      enqueueNotification({
        kind: 'match_confirmed',
        recipientEmail: user.email,
        subject: 'Your Flow session is scheduled',
        body: `Your 30-minute English session is scheduled for ${match.scheduledAt}.`,
      }),
    ),
  )

  return { match, session }
}

export function markMatchForRematch(matchId: string) {
  const match = matches.find((item) => item.id === matchId)
  if (!match) throw new Error('Match not found.')
  match.status = 'rematch_queue'
  return match
}

export function recordAiMessage(input: {
  sessionId: string
  userId: string
  prompt: string
  response: string
}) {
  const message: AiMessage = {
    id: `ai-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...input,
  }
  aiMessages.push(message)
  return message
}

export async function generateSessionArtifacts(sessionId: string, transcript: string) {
  const note: StudyNote = {
    id: `note-${Date.now()}`,
    sessionId,
    contentJson: createStudyNoteFromTranscript(transcript),
    pdfUrl: `/pdf/study-notes/${sessionId}.pdf`,
    createdAt: new Date().toISOString(),
  }
  const script = createAudiobookScript(transcript)
  const audio = await synthesizeAudiobook(script, sessionId)
  const audiobook: Audiobook = {
    id: `audio-${Date.now()}`,
    sessionId,
    script: audio.script,
    audioUrl: audio.audioUrl,
    createdAt: new Date().toISOString(),
  }

  studyNotes.push(note)
  audiobooks.push(audiobook)

  return { note, audiobook }
}

export function createUserFromRapid(input: { email: string; orderId: string; depositAmount: number }) {
  const nickname = input.email.split('@')[0] || 'Flow Member'
  const user = upsertOnboarding({
    email: input.email,
    nickname,
    level: 'intermediate',
    interests: ['conversation'],
    intro: 'Created from Rapid payment webhook. Onboarding pending.',
    availability: [{ weekday: 1, startHour: 20, endHour: 22 }],
  })

  const payment = payments.find((item) => item.rapidOrderId === input.orderId)
  if (!payment) {
    payments.push({
      id: `pay-${Date.now()}`,
      userId: user.id,
      rapidOrderId: input.orderId,
      status: 'paid',
      depositAmount: input.depositAmount,
    })
  }

  return user
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
