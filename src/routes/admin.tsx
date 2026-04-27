import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { getFlowSnapshot } from '../lib/data'
import { canMatchUsers } from '../lib/matching'

export const Route = createFileRoute('/admin')({
  loader: () => getFlowSnapshot(),
  component: AdminPage,
})

function AdminPage() {
  const data = Route.useLoaderData()
  const members = data.users.filter((user) =>
    data.roles.some((role) => role.userId === user.id && role.role === 'member'),
  )
  const [level, setLevel] = useState('all')
  const [userA, setUserA] = useState(members[0]?.id || '')
  const [userB, setUserB] = useState(members[1]?.id || '')
  const [message, setMessage] = useState('')
  const filteredMembers = useMemo(
    () => members.filter((user) => level === 'all' || user.level === level),
    [level, members],
  )

  return (
    <main className="page stack">
      <section className="grid two">
        <div className="stack">
          <span className="eyebrow">Flow Ops</span>
          <h1>Manual matching dashboard</h1>
          <p className="lede">
            1기는 레벨, 가능 시간대, 관심사를 운영자가 보고 직접 매칭합니다. 노쇼나 결석은
            rematch queue로 돌릴 수 있습니다.
          </p>
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
            setMessage(result.ok ? `Match created. Session: ${result.sessionId}` : result.error || 'Failed')
          }}
        >
          <h2>Create match</h2>
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
          <p className={canPair(data, userA, userB) ? 'status ready' : 'status waiting'}>
            {canPair(data, userA, userB) ? 'Eligible pair' : 'Needs similar level and overlap'}
          </p>
          <button className="button" type="submit">
            Create session slot
          </button>
          {message ? <p className="status ready">{message}</p> : null}
        </form>
      </section>

      <section className="card stack">
        <div className="row">
          <h2>Applicants</h2>
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
        <h2>Sessions and rematch queue</h2>
        {data.matches.length ? (
          <div className="grid two">
            {data.matches.map((match) => (
              <article className="panel stack" key={match.id}>
                <span className="status ready">{match.status}</span>
                <h3>{match.id}</h3>
                <p>{new Date(match.scheduledAt).toLocaleString()}</p>
                <p>{match.dailyRoomUrl}</p>
                <button
                  className="button ghost"
                  type="button"
                  onClick={async () => {
                    await fetch('/api/rematch', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ matchId: match.id }),
                    })
                    setMessage(`${match.id} moved to rematch queue.`)
                  }}
                >
                  Move to rematch queue
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">No sessions yet. Create the first demo match above.</p>
        )}
      </section>
    </main>
  )
}

function canPair(data: ReturnType<typeof getFlowSnapshot>, userAId: string, userBId: string) {
  const userA = data.users.find((user) => user.id === userAId)
  const userB = data.users.find((user) => user.id === userBId)

  if (!userA || !userB) return false
  return canMatchUsers(userA, userB, data.availability, data.matches)
}
