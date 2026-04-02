import styles from '../../styles/FeaturePage.module.css'

const summaryCards = [
  { title: '오늘 예약 수', value: '0건', helper: '실제 예약 API 연결 전입니다.' },
  { title: '이번 달 매출', value: '0원', helper: '매출 데이터 연결 시 자동 집계됩니다.' },
  { title: '최근 예약', value: '0건', helper: '최근 예약 목록 컴포넌트가 들어올 자리입니다.' },
]


const AdminDashboardPage = () => {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>관리자 대시보드</h1>
        <p className={styles.description}>
          로그인 상태에서는 공개 페이지 대신 관리자 전용 메뉴와 라우트가 보이도록 구조를
          분리했습니다.
        </p>
      </div>

      <div className={styles.metricGrid}>
        {summaryCards.map(({ title, value, helper }) => (
          <article key={title} className={styles.metricCard}>
            <span className={styles.metricLabel}>{title}</span>
            <strong className={styles.metricValue}>{value}</strong>
            <p className={styles.metricHelper}>{helper}</p>
          </article>
        ))}
      </div>
      
    </section>
  )
}

export default AdminDashboardPage
