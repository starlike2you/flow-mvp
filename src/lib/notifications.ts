type NotificationKind = 'match_confirmed' | 'session_reminder' | 'study_note_ready'

export async function enqueueNotification(input: {
  kind: NotificationKind
  recipientEmail: string
  subject: string
  body: string
}) {
  const resendKey = process.env.RESEND_API_KEY

  if (!resendKey) {
    return {
      id: `notification-${Date.now()}`,
      provider: 'stub' as const,
      ...input,
    }
  }

  return {
    id: `notification-${Date.now()}`,
    provider: 'resend-ready' as const,
    ...input,
  }
}
