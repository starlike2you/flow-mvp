export function createAudiobookScript(transcript: string) {
  const base = transcript.trim() || 'We talked about building confidence through daily English practice.'

  return [
    'A natural version of today\'s conversation:',
    '',
    base,
    '',
    'Speaker A: I am learning to speak with less fear and more curiosity.',
    'Speaker B: Same here. It feels easier when the other person is practicing too.',
  ].join('\n')
}

export async function synthesizeAudiobook(script: string, sessionId: string) {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    return {
      script,
      audioUrl: `/audio/placeholders/${sessionId}.mp3`,
      provider: 'stub' as const,
    }
  }

  return {
    script,
    audioUrl: `/storage/audiobooks/${sessionId}.mp3`,
    provider: 'elevenlabs-ready' as const,
  }
}
