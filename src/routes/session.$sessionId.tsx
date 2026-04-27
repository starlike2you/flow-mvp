import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FlowSnapshot } from '../lib/types'

export const Route = createFileRoute('/session/$sessionId')({
  component: SessionPage,
})

function SessionPage() {
  const { sessionId } = Route.useParams()
  const [data, setData] = useState<FlowSnapshot | null>(null)
  const [prompt, setPrompt] = useState('How do I say I need more time to think?')
  const [answer, setAnswer] = useState('')
  const [transcript, setTranscript] = useState(
    'I wanted to explain my opinion about confidence, but I forgot the exact phrase.',
  )
  const [artifactMessage, setArtifactMessage] = useState('')

  async function refresh() {
    const snapshot = (await fetch('/api/snapshot').then((response) => response.json())) as FlowSnapshot
    setData(snapshot)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const session = data?.sessions.find((item) => item.id === sessionId)
  const match = data?.matches.find((item) => item.id === session?.matchId)
  const week = data?.weeklyContents[0]
  const messages = data?.aiMessages.filter((message) => message.sessionId === sessionId) || []
  const note = data?.studyNotes.find((item) => item.sessionId === sessionId)
  const audiobook = data?.audiobooks.find((item) => item.sessionId === sessionId)

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
            Daily room: {match?.dailyRoomUrl || '운영자 화면에서 세션을 먼저 생성하세요.'}
          </p>
        </div>
      </section>

      <aside className="stack">
        <section className="card stack">
          <span className="eyebrow">Today&apos;s questions</span>
          <h2>{week?.title || 'Session questions'}</h2>
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
                  sessionId,
                  userId: match?.userA || 'user-juyeon',
                  prompt,
                  context: week?.questions.join(' / '),
                }),
              })
              const result = (await response.json()) as { response: string }
              setAnswer(result.response)
              await refresh()
            }}
          >
            Ask AI Teacher
          </button>
          {answer ? <div className="chat-message">{answer}</div> : null}
          <div className="chat-log">
            {messages.map((message) => (
              <div className="chat-message" key={message.id}>
                <strong>{message.prompt}</strong>
                <p>{message.response}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card stack">
          <h2>Post-session automation</h2>
          <label>
            <span className="label">Transcript</span>
            <textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} />
          </label>
          <button
            className="button secondary"
            type="button"
            onClick={async () => {
              const response = await fetch('/api/artifacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, transcript }),
              })
              const result = (await response.json()) as { ok: boolean }
              setArtifactMessage(result.ok ? '학습 노트와 오디오북이 저장됐습니다.' : 'Generation failed.')
              await refresh()
            }}
          >
            Generate artifacts
          </button>
          {artifactMessage ? <p className="status ready">{artifactMessage}</p> : null}
          {note ? <p className="muted">Study note saved: {note.id}</p> : null}
          {audiobook ? <p className="muted">Audiobook URL: {audiobook.audioUrl}</p> : null}
        </section>
      </aside>
    </main>
  )
}
