import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

function OnboardingPage() {
  const [message, setMessage] = useState('')

  return (
    <main className="page">
      <div className="grid two">
        <section className="stack">
          <span className="eyebrow">Member onboarding</span>
          <h1>말하기가 시작되는 프로필을 만듭니다.</h1>
          <p className="lede">
            영어 레벨, 관심사, 가능 시간대를 입력하면 운영자가 비슷한 파트너와 수동
            매칭합니다.
          </p>
        </section>
        <form
          className="card stack"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            const response = await fetch('/api/onboarding', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: form.get('email'),
                nickname: form.get('nickname'),
                level: form.get('level'),
                interests: String(form.get('interests') || '')
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
                intro: form.get('intro'),
                photoUrl: form.get('photoUrl'),
                availability: [
                  {
                    weekday: Number(form.get('weekday')),
                    startHour: Number(form.get('startHour')),
                    endHour: Number(form.get('endHour')),
                  },
                ],
              }),
            })
            const result = (await response.json()) as { ok: boolean; nickname?: string; error?: string }
            setMessage(result.ok ? `${result.nickname} profile saved.` : result.error || 'Save failed.')
          }}
        >
          <label>
            <span className="label">Email</span>
            <input name="email" type="email" defaultValue="new-member@example.com" required />
          </label>
          <label>
            <span className="label">Nickname</span>
            <input name="nickname" defaultValue="Flowmate" required />
          </label>
          <label>
            <span className="label">Level</span>
            <select name="level" defaultValue="intermediate">
              <option value="starter">Starter</option>
              <option value="elementary">Elementary</option>
              <option value="intermediate">Intermediate</option>
              <option value="upper">Upper intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label>
            <span className="label">Interests, comma separated</span>
            <input name="interests" defaultValue="career, travel, marketing" />
          </label>
          <label>
            <span className="label">One-line intro</span>
            <textarea name="intro" defaultValue="I want to feel less nervous in English meetings." />
          </label>
          <label>
            <span className="label">Photo URL, optional</span>
            <input name="photoUrl" placeholder="https://..." />
          </label>
          <div className="grid three">
            <label>
              <span className="label">Weekday</span>
              <select name="weekday" defaultValue="1">
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
              </select>
            </label>
            <label>
              <span className="label">Start</span>
              <input name="startHour" type="number" defaultValue="20" min="7" max="23" />
            </label>
            <label>
              <span className="label">End</span>
              <input name="endHour" type="number" defaultValue="22" min="8" max="24" />
            </label>
          </div>
          <button className="button" type="submit">
            Save onboarding
          </button>
          {message ? <p className="status ready">{message}</p> : null}
        </form>
      </div>
    </main>
  )
}
