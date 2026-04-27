type DailyRoomRequest = {
  matchId: string
  scheduledAt: string
}

export async function createDailyRoom({ matchId, scheduledAt }: DailyRoomRequest) {
  const apiKey = process.env.DAILY_API_KEY
  const domain = process.env.DAILY_DOMAIN

  if (!apiKey || !domain) {
    return {
      url: `https://flow.daily.co/dev-${matchId}`,
      provider: 'stub' as const,
    }
  }

  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `flow-${matchId}`,
      privacy: 'private',
      properties: {
        exp: Math.floor(new Date(scheduledAt).getTime() / 1000) + 60 * 60 * 2,
        enable_recording: 'cloud',
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Daily room creation failed: ${response.status}`)
  }

  const room = (await response.json()) as { url: string }
  return { url: room.url, provider: 'daily' as const }
}
