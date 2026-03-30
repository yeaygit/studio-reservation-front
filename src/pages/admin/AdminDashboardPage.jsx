import styles from '../../styles/FeaturePage.module.css'

const summaryCards = [
  { title: '오늘 예약 수', value: '0건', helper: '실제 예약 API 연결 전입니다.' },
  { title: '이번 달 매출', value: '0원', helper: '매출 데이터 연결 시 자동 집계됩니다.' },
  { title: '최근 예약', value: '0건', helper: '최근 예약 목록 컴포넌트가 들어올 자리입니다.' },
]

const quickLinks = [
  {
    path: '/admin/reservations',
    label: '예약내역 관리',
    description: '예약 목록과 상태, 고객 요청 사항을 관리합니다.',
  },
  {
    path: '/admin/reservation-settings',
    label: '예약 시간 설정',
    description: '예약 가능한 시간대와 기본 운영 슬롯을 설정합니다.',
  },
  {
    path: '/admin/holidays',
    label: '휴일 + 쉬는날 관리',
    description: '정기 휴무일과 임시 휴무일을 등록하고 노출합니다.',
  },
  {
    path: '/admin/blacklist',
    label: '블랙리스트 차단',
    description: '예약 제한이 필요한 고객을 등록하고 관리합니다.',
  },
  {
    path: '/admin/alimtalk',
    label: '카카오 알림톡 문구 관리',
    description: '예약 안내, 확정, 취소 알림에 사용할 문구를 관리합니다.',
  },
  {
    path: '/admin/terms',
    label: '약관 관리',
    description: '예약 약관과 동의 문구를 수정하고 버전을 관리합니다.',
  },
  {
    path: '/admin/faq',
    label: '공지사항 및 FAQ 관리',
    description: '공지사항과 자주 묻는 질문을 등록하고 수정합니다.',
  },
  {
    path: '/admin/photo-types',
    label: '사진 type 설정',
    description: '촬영 타입과 사진 분류 옵션을 설정합니다.',
  },
]

const AdminDashboardPage = () => {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>ADMIN DASHBOARD</p>
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

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>관리자 메뉴 바로가기</h2>
        <div className={styles.cardGrid}>
          {quickLinks.map(({ path, label, description }) => (
            <article key={path} className={styles.card}>
              <h3 className={styles.cardTitle}>{label}</h3>
              <p className={styles.cardText}>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AdminDashboardPage
