import { Link, createFileRoute } from '@tanstack/react-router'
import { getFlowSnapshot } from '../lib/data'

export const Route = createFileRoute('/dashboard')({
  loader: () => getFlowSnapshot(),
  component: DashboardPage,
})

function DashboardPage() {
  const data = Route.useLoaderData()
  const member = data.users.find((user) => user.id === 'user-juyeon') || data.users[0]
  const match = data.matches.find((item) => item.userA === member?.id || item.userB === member?.id)
  const session = data.sessions.find((item) => item.matchId === match?.id)
  const week = data.weeklyContents[0]
  const note = data.studyNotes.find((item) => item.sessionId === session?.id)
  const audiobook = data.audiobooks.find((item) => item.sessionId === session?.id)

  return (
    <main className="page stack">
      <section className="grid two">
        <div className="card stack">
          <span className="eyebrow">This week</span>
          <h1>{week?.title}</h1>
          <p className="lede">{week?.contentMd}</p>
          <ul className="pill-list">
            {week?.questions.map((question) => (
              <li className="pill" key={question}>
                {question}
              </li>
            ))}
          </ul>
        </div>
        <aside className="card stack">
          <span className={match ? 'status ready' : 'status waiting'}>
            {match ? 'Match scheduled' : 'Waiting for match'}
          </span>
          <h2>{member?.nickname}'s Flow</h2>
          <p>{member?.intro}</p>
          {match && session ? (
            <>
              <p>
                Session time: <strong>{new Date(match.scheduledAt).toLocaleString()}</strong>
              </p>
              <Link className="button" to="/session/$sessionId" params={{ sessionId: session.id }}>
                Join session
              </Link>
            </>
          ) : (
            <Link className="button secondary" to="/admin">
              Ask ops to match demo users
            </Link>
          )}
        </aside>
      </section>

      <section className="grid two">
        <article className="card stack">
          <h2>Study note</h2>
          {note ? (
            <>
              <ul className="pill-list">
                {note.contentJson.expressions.map((expression) => (
                  <li className="pill" key={expression.phrase}>
                    {expression.phrase}
                  </li>
                ))}
              </ul>
              <a className="button ghost" href={note.pdfUrl}>
                Download PDF
              </a>
            </>
          ) : (
            <p className="muted">세션 페이지에서 Generate artifacts를 누르면 노트가 생성됩니다.</p>
          )}
        </article>
        <article className="card stack">
          <h2>Audiobook</h2>
          {audiobook ? (
            <>
              <p>{audiobook.script.slice(0, 180)}...</p>
              <a className="button ghost" href={audiobook.audioUrl}>
                Download MP3
              </a>
            </>
          ) : (
            <p className="muted">오디오북 script와 placeholder MP3 URL이 세션 후 생성됩니다.</p>
          )}
        </article>
      </section>
    </main>
  )
}
