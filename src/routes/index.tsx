import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FlowSnapshot } from '../lib/types'

export const Route = createFileRoute('/')({
  component: OperationsHome,
})

function OperationsHome() {
  const [data, setData] = useState<FlowSnapshot | null>(null)

  useEffect(() => {
    fetch('/api/snapshot')
      .then((response) => response.json())
      .then((snapshot: FlowSnapshot) => setData(snapshot))
  }, [])

  const paidMembers = data?.payments.filter((payment) => payment.status === 'paid').length || 0
  const scheduledSessions = data?.matches.filter((match) => match.status === 'scheduled').length || 0

  return (
    <main className="page stack">
      <section className="grid two">
        <div className="card stack">
          <span className="eyebrow">Flow MVP 운영 홈</span>
          <h1>신청자 등록부터 세션 후 학습 자료까지 운영합니다.</h1>
          <p className="lede">
            이 화면은 랜딩이 아니라 운영 시작점입니다. 신청자를 등록하고, 운영자가 매칭하고,
            세션에서 AI 도움과 학습 노트 생성을 실제 저장 데이터로 확인합니다.
          </p>
          <div className="cta-row">
            <Link className="button" to="/admin">
              운영자 매칭 열기
            </Link>
            <Link className="button secondary" to="/onboarding">
              신청자 등록
            </Link>
            <Link className="button ghost" to="/dashboard">
              사용자 화면
            </Link>
          </div>
        </div>
        <aside className="card stack">
          <span className="status ready">File-backed data store</span>
          <h2>현재 운영 상태</h2>
          <div className="grid two">
            <div className="metric">
              <strong>{paidMembers}</strong>
              <p>paid applicants</p>
            </div>
            <div className="metric">
              <strong>{scheduledSessions}</strong>
              <p>scheduled sessions</p>
            </div>
          </div>
          <p className="muted">
            데이터는 로컬 `.flow-data/store.json`에 저장되어 새로고침과 서버 재시작 후에도 유지됩니다.
          </p>
        </aside>
      </section>

      <section className="grid three">
        {[
          ['1. 신청자 등록', '온보딩 폼으로 레벨, 관심사, 가능 시간대를 저장합니다.'],
          ['2. 운영자 매칭', '레벨과 가능 시간대가 맞는 두 명을 골라 세션을 생성합니다.'],
          ['3. 세션 진행', '세션 화면에서 질문, Daily room URL, AI Teacher 패널을 사용합니다.'],
          ['4. 학습 자료', '트랜스크립트를 넣으면 학습 노트와 오디오북 스크립트를 저장합니다.'],
          ['5. 외부 연동', 'Daily/AI/TTS 키가 있으면 실제 서비스 호출로 전환됩니다.'],
          ['Storage', 'MVP 운영 데이터는 파일 저장소에 유지됩니다.'],
        ].map(([title, body]) => (
          <article className="card" key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
