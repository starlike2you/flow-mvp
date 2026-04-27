import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FlowSnapshot } from '../lib/types'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const [data, setData] = useState<FlowSnapshot | null>(null)
  const [memberId, setMemberId] = useState('user-juyeon')

  useEffect(() => {
    fetch('/api/snapshot')
      .then((response) => response.json())
      .then((snapshot: FlowSnapshot) => setData(snapshot))
  }, [])

  const members =
    data?.users.filter((user) =>
      data.roles.some((role) => role.userId === user.id && role.role === 'member'),
    ) || []
  const member = members.find((user) => user.id === memberId) || members[0]
  const match = data?.matches.find((item) => item.userA === member?.id || item.userB === member?.id)
  const session = data?.sessions.find((item) => item.matchId === match?.id)
  const week = data?.weeklyContents[0]
  const note = data?.studyNotes.find((item) => item.sessionId === session?.id)
  const audiobook = data?.audiobooks.find((item) => item.sessionId === session?.id)

  return (
    <main className="page stack">
      <section className="grid two">
        <div className="card stack">
          <span className="eyebrow">사용자 화면</span>
          <h1>{week?.title || 'Weekly content'}</h1>
          <p className="lede">{week?.contentMd || 'Loading weekly content...'}</p>
          <label>
            <span className="label">현재 사용자</span>
            <select value={member?.id || ''} onChange={(event) => setMemberId(event.target.value)}>
              {members.map((user) => (
                <option value={user.id} key={user.id}>
                  {user.nickname}
                </option>
              ))}
            </select>
          </label>
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
            {match ? '세션 예약됨' : '매칭 대기'}
          </span>
          <h2>{member?.nickname || 'Member'}'s Flow</h2>
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
              운영자 화면에서 매칭 만들기
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
            <p className="muted">세션에서 학습 자료를 생성하면 여기에 표시됩니다.</p>
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
            <p className="muted">세션 후 오디오북 스크립트와 MP3 URL이 저장됩니다.</p>
          )}
        </article>
      </section>
    </main>
  )
}
