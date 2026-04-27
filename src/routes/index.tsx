import { Link, createFileRoute } from '@tanstack/react-router'
import { getFlowSnapshot } from '../lib/data'

export const Route = createFileRoute('/')({
  loader: () => getFlowSnapshot(),
  component: LandingPage,
})

function LandingPage() {
  const data = Route.useLoaderData()
  const paidMembers = data.payments.filter((payment) => payment.status === 'paid').length

  return (
    <main className="page">
      <section className="hero">
        <div className="stack">
          <span className="eyebrow">Flow 1기 모집</span>
          <h1>영어를 배우는 대신, 영어로 대화하는 환경.</h1>
          <p className="lede">
            비슷한 실력의 파트너와 30분간 100% 영어로 대화하고, AI 선생님이 막히는
            순간을 도와줍니다. 세션이 끝나면 내 대화 기반 학습 노트와 오디오북이
            자동으로 만들어집니다.
          </p>
          <div className="cta-row">
            <a className="button" href={import.meta.env.VITE_RAPID_APPLY_URL || '/onboarding'}>
              보증금 결제하고 신청하기
            </a>
            <Link className="button secondary" to="/dashboard">
              데모 둘러보기
            </Link>
          </div>
        </div>
        <aside className="card stack">
          <span className="status ready">MVP 운영 준비</span>
          <h2>4주, 주 1회, 30분</h2>
          <p>
            1기는 운영자가 직접 레벨과 가능 시간대를 보고 매칭합니다. 외부 결제와 화상,
            AI 연동은 환경변수만 연결하면 실제 서비스로 전환됩니다.
          </p>
          <div className="grid two">
            <div className="metric">
              <strong>{paidMembers}</strong>
              <p>paid applicants</p>
            </div>
            <div className="metric">
              <strong>{data.matches.length}</strong>
              <p>scheduled matches</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid three">
        {[
          ['1. 콘텐츠', '매주 월요일 운영팀이 큐레이션한 주제와 질문을 발송합니다.'],
          ['2. 1:1 세션', 'Daily.co room에서 30분간 100% 영어 대화를 진행합니다.'],
          ['3. AI 선생님', '막히는 순간 사이드 패널에서 표현, 문법, 발음 팁을 받습니다.'],
          ['4. 학습 노트', '트랜스크립트 기반으로 핵심 표현과 피드백을 정리합니다.'],
          ['5. 오디오북', '내 대화를 자연스러운 원어민 영어로 각색해 MP3로 제공합니다.'],
          ['Privacy', '녹음 전 동의 모달과 30일 삭제 정책을 제품 화면에 명시합니다.'],
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
