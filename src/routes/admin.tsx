import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { canMatchUsers } from '../lib/matching'
import type { FlowSnapshot } from '../lib/types'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const [data, setData] = useState<FlowSnapshot | null>(null)
  const [level, setLevel] = useState('all')
  const [userA, setUserA] = useState('')
  const [userB, setUserB] = useState('')
  const [message, setMessage] = useState('')

  async function refresh() {
    const snapshot = (await fetch('/api/snapshot').then((response) => response.json())) as FlowSnapshot
    setData(snapshot)
    const members = getMembers(snapshot)
    setUserA((current) => current || members[0]?.id || '')
    setUserB((current) => current || members[1]?.id || '')
  }

  useEffect(() => {
    void refresh()
  }, [])

  const members = data ? getMembers(data) : []
  const filteredMembers = useMemo(
    () => members.filter((user) => level === 'all' || user.level === level),
    [level, members],
  )

  return (
    <main className="page stack">
      <section className="grid two">
        <div className="stack">
          <span className="eyebrow">Flow Ops</span>
          <h1>실제 운영 매칭 대시보드</h1>
          <p className="lede">
            신청자를 저장하고, 조건이 맞는 두 명을 매칭하고, 세션 링크를 발급합니다. 모든 변경은
            파일 저장소에 남습니다.
          </p>
          <div className="cta-row">
            <Link className="button secondary" to="/onboarding">
              신청자 추가
            </Link>
            <button className="button ghost" type="button" onClick={() => void refresh()}>
              새로고침
            </button>
          </div>
        </div>
        <form
          className="card stack"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            const response = await fetch('/api/matches', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userA: form.get('userA'),
                userB: form.get('userB'),
                scheduledAt: form.get('scheduledAt'),
              }),
            })
            const result = (await response.json()) as { ok: boolean; sessionId?: string; error?: string }
            setMessage(result.ok ? `매칭 완료. Session: ${result.sessionId}` : result.error || 'Failed')
            await refresh()
          }}
        >
          <h2>세션 만들기</h2>
          <label>
            <span className="label">User A</span>
            <select name="userA" value={userA} onChange={(event) => setUserA(event.target.value)}>
              {members.map((user) => (
                <option value={user.id} key={user.id}>
                  {user.nickname} / {user.level}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">User B</span>
            <select name="userB" value={userB} onChange={(event) => setUserB(event.target.value)}>
              {members.map((user) => (
                <option value={user.id} key={user.id}>
                  {user.nickname} / {user.level}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Scheduled at</span>
            <input name="scheduledAt" type="datetime-local" defaultValue="2026-04-27T21:00" />
          </label>
          <p className={data && canPair(data, userA, userB) ? 'status ready' : 'status waiting'}>
            {data && canPair(data, userA, userB) ? '매칭 가능' : '레벨/시간대 조건 확인 필요'}
          </p>
          <button className="button" type="submit" disabled={!data || !canPair(data, userA, userB)}>
            세션 생성
          </button>
          {message ? <p className="status ready">{message}</p> : null}
        </form>
      </section>

      <section className="card stack">
        <div className="row">
          <h2>신청자</h2>
          <select value={level} onChange={(event) => setLevel(event.target.value)} style={{ maxWidth: 240 }}>
            <option value="all">All levels</option>
            <option value="starter">Starter</option>
            <option value="elementary">Elementary</option>
            <option value="intermediate">Intermediate</option>
            <option value="upper">Upper</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="grid three">
          {filteredMembers.map((user) => (
            <article className="panel stack" key={user.id}>
              <span className="status ready">{user.level}</span>
              <h3>{user.nickname}</h3>
              <p>{user.email}</p>
              <p>{user.intro}</p>
              <ul className="pill-list">
                {user.interests.map((interest) => (
                  <li className="pill" key={interest}>
                    {interest}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="card stack">
        <h2>세션 / 재매칭 큐</h2>
        {data?.matches.length ? (
          <div className="grid two">
            {data.matches.map((match) => {
              const session = data.sessions.find((item) => item.matchId === match.id)
              return (
                <article className="panel stack" key={match.id}>
                  <span className="status ready">{match.status}</span>
                  <h3>{match.id}</h3>
                  <p>{new Date(match.scheduledAt).toLocaleString()}</p>
                  <p>{match.dailyRoomUrl}</p>
                  {session ? (
                    <Link className="button secondary" to="/session/$sessionId" params={{ sessionId: session.id }}>
                      세션 열기
                    </Link>
                  ) : null}
                  <button
                    className="button ghost"
                    type="button"
                    onClick={async () => {
                      await fetch('/api/rematch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ matchId: match.id }),
                      })
                      setMessage(`${match.id} 재매칭 큐로 이동`)
                      await refresh()
                    }}
                  >
                    재매칭 큐로 이동
                  </button>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="muted">아직 세션이 없습니다. 위에서 첫 매칭을 만드세요.</p>
        )}
      </section>
    </main>
  )
}

function getMembers(data: FlowSnapshot) {
  return data.users.filter((user) =>
    data.roles.some((role) => role.userId === user.id && role.role === 'member'),
  )
}

function canPair(data: FlowSnapshot, userAId: string, userBId: string) {
  const userA = data.users.find((user) => user.id === userAId)
  const userB = data.users.find((user) => user.id === userBId)

  if (!userA || !userB) return false
  return canMatchUsers(userA, userB, data.availability, data.matches)
}
