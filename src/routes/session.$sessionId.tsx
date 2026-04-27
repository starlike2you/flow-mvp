import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { getFlowSnapshot } from '../lib/data'

export const Route = createFileRoute('/session/$sessionId')({
  loader: ({ params }) => {
    const data = getFlowSnapshot()
    return { ...data, sessionId: params.sessionId }
  },
  component: SessionPage,
})

function SessionPage() {
  const data = Route.useLoaderData()
  const session = data.sessions.find((item) => item.id === data.sessionId)
  const match = data.matches.find((item) => item.id === session?.matchId)
  const week = data.weeklyContents[0]
  const [prompt, setPrompt] = useState('How do I say I need more time to think?')
  const [answer, setAnswer] = useState('')
  const [artifactMessage, setArtifactMessage] = useState('')

  return (
    <main className="page session-layout">
      <section className="video-stage">
        <div className="stack">
          <div className="row">
            <span className="status ready">30:00 English only</span>
            <span className="status waiting">Recording consent required</span>
          </div>
          <div className="video-grid">
            <div className="video-tile">A</div>
            <div className="video-tile">B</div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>
            Daily room mount point: {match?.dailyRoomUrl || 'Create a match from admin first.'}
          </p>
        </div>
      </section>

      <aside className="stack">
        <section className="card stack">
          <span className="eyebrow">Today&apos;s questions</span>
          <h2>{week?.title}</h2>
          <ul className="stack">
            {week?.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </section>

        <section className="card stack">
          <h2>Ask AI Teacher</h2>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          <button
            className="button"
            type="button"
            onClick={async () => {
              const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId: data.sessionId,
                  userId: 'user-juyeon',
                  prompt,
                  context: week?.questions.join(' / '),
                }),
              })
              const result = (await response.json()) as { response: string }
              setAnswer(result.response)
            }}
          >
            Ask AI Teacher
          </button>
          {answer ? <div className="chat-message">{answer}</div> : null}
        </section>

        <section className="card stack">
          <h2>Post-session automation</h2>
          <p className="muted">
            Uses a transcript stub now. Later this will consume Daily recording, Whisper transcript,
            LLM note generation, and ElevenLabs TTS.
          </p>
          <button
            className="button secondary"
            type="button"
            onClick={async () => {
              const response = await fetch('/api/artifacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId: data.sessionId,
                  transcript:
                    'I wanted to explain my opinion about confidence, but I forgot the exact phrase.',
                }),
              })
              const result = (await response.json()) as { ok: boolean }
              setArtifactMessage(result.ok ? 'Study note and audiobook generated.' : 'Generation failed.')
            }}
          >
            Generate artifacts
          </button>
          {artifactMessage ? <p className="status ready">{artifactMessage}</p> : null}
        </section>
      </aside>
    </main>
  )
}
