export type EnglishLevel = 'starter' | 'elementary' | 'intermediate' | 'upper' | 'advanced'
export type UserRole = 'admin' | 'member'
export type PaymentStatus = 'paid' | 'refunded' | 'pending'
export type MatchStatus = 'scheduled' | 'completed' | 'no_show' | 'cancelled' | 'rematch_queue'
export type SessionStatus = 'scheduled' | 'live' | 'completed'

export type FlowUser = {
  id: string
  email: string
  nickname: string
  level: EnglishLevel
  interests: string[]
  intro: string
  photoUrl?: string
  createdAt: string
}

export type UserRoleRecord = {
  userId: string
  role: UserRole
}

export type Availability = {
  userId: string
  weekday: number
  startHour: number
  endHour: number
}

export type Payment = {
  id: string
  userId: string
  rapidOrderId: string
  status: PaymentStatus
  depositAmount: number
  refundedAt?: string
}

export type WeeklyContent = {
  id: string
  weekNo: number
  title: string
  contentMd: string
  questions: string[]
}

export type Match = {
  id: string
  userA: string
  userB: string
  scheduledAt: string
  status: MatchStatus
  dailyRoomUrl: string
}

export type Session = {
  id: string
  matchId: string
  startedAt?: string
  endedAt?: string
  status: SessionStatus
  recordingUrl?: string
  transcriptUrl?: string
}

export type AiMessage = {
  id: string
  sessionId: string
  userId: string
  prompt: string
  response: string
  createdAt: string
}

export type StudyNote = {
  id: string
  sessionId: string
  contentJson: StudyNoteContent
  pdfUrl?: string
  createdAt: string
}

export type StudyNoteContent = {
  expressions: Array<{ phrase: string; meaning: string; example: string }>
  stuckMoments: Array<{ original: string; suggestion: string }>
  feedback: string[]
  nextPrepWords: string[]
}

export type Audiobook = {
  id: string
  sessionId: string
  script: string
  audioUrl: string
  createdAt: string
}

export type FlowSnapshot = {
  users: FlowUser[]
  roles: UserRoleRecord[]
  availability: Availability[]
  payments: Payment[]
  weeklyContents: WeeklyContent[]
  matches: Match[]
  sessions: Session[]
  aiMessages: AiMessage[]
  studyNotes: StudyNote[]
  audiobooks: Audiobook[]
}
