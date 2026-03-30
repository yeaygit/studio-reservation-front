import styles from '../styles/FeaturePage.module.css'

const ServiceCostumePage = () => {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>SERVICE GUIDE</p>
        <h1 className={styles.title}>의상 & 소품 안내</h1>
        <p className={styles.description}>
          의상, 소품, 준비물 가이드를 보여줄 페이지입니다. 현재는 라우트만 먼저 연결해둔
          상태입니다.
        </p>
      </div>
    </section>
  )
}

export default ServiceCostumePage
