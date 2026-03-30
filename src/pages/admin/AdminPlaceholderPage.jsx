import styles from '../../styles/FeaturePage.module.css'

const AdminPlaceholderPage = ({ title, description }) => {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>ADMIN MENU</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>다음 작업</h2>
        <p className={styles.panelText}>
          관리자 메뉴 흐름은 연결해두었고, 이제 이 페이지 안에서 실제 데이터 조회와 수정 UI를
          붙이면 됩니다.
        </p>
      </div>
    </section>
  )
}

export default AdminPlaceholderPage
