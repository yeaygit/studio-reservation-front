import { Info, Timer } from 'lucide-react'
import featureStyles from '../../styles/FeaturePage.module.css'
import styles from '../../styles/ShootingTypePage.module.css'
import { formatPrice } from '../../utils/formatSetting'
import { useEffect, useState } from 'react'
import customAxios from '../../utils/customAxios'
import { getApiErrorMessage } from '../../utils/apiError'

interface ShootingTypeCard {
  id?: number
  code: string
  label: string
  price: number
  duration: number
  description?: string | null
}


const guideNotes = [
  {
    title: '촬영 시간 안내',
    description: '기본 촬영 시간은 타입별로 다르며, 현장 상황에 따라 약간의 차이가 생길 수 있습니다.',
  },
  {
    title: '상품 구성 확인',
    description:
      '인화 매수와 제공 방식은 상품 설명을 기준으로 안내되며, 예약 전 문의로 다시 확인하실 수 있습니다.',
  },
]

const ShootingTypePage = () => {
  const [shootingTypes, setShootingTypes] = useState<ShootingTypeCard[]>([])

  const loadShootingTypes = async (): Promise<ShootingTypeCard[]> => {
    try {
      const res = await customAxios.get<ShootingTypeCard[]>('/v1/settings/shooting-types')
      setShootingTypes(res.data)
      return res.data
    } catch (error: unknown) {
      console.log(getApiErrorMessage(error, '촬영 유형 정보를 불러오지 못했습니다.'))
      return []
    }
  }

  useEffect(() => {
    void loadShootingTypes()
  }, [])

  return (
    <section className={featureStyles.page}>
      <div className={featureStyles.hero}>
        <p className={featureStyles.eyebrow}>SERVICE GUIDE</p>
        <h1 className={featureStyles.title}>촬영 종류 안내</h1>
        <p className={featureStyles.description}>
          스튜디오에서 예약 가능한 촬영 타입과 기본 구성을 한눈에 볼 수 있도록 정리한 안내
          페이지입니다.
        </p>
      </div>
      <section className={featureStyles.panel}>
        <h2 className={featureStyles.panelTitle}>예약 전 참고</h2>
        <div className={styles.noteGrid}>
          {guideNotes.map((note) => (
            <article key={note.title} className={styles.noteCard}>
              <div className={styles.noteIcon}>
                <Info size={18} />
              </div>
              <div className={styles.noteBody}>
                <strong className={styles.noteTitle}>{note.title}</strong>
                <p className={styles.noteText}>{note.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className={featureStyles.panel}>
        <h2 className={featureStyles.panelTitle}>촬영 타입</h2>
        <div className={featureStyles.cardGrid}>
          {shootingTypes.map((shootingType) => (
            <article
              key={shootingType.id ?? shootingType.code}
              className={`${featureStyles.card} ${styles.typeCard}`}
            >
              <div className={styles.titleRow}>
                <h3 className={featureStyles.cardTitle}>{shootingType.label}</h3>
                <strong className={styles.price}>{formatPrice(shootingType.price)}</strong>
              </div>

              <p className={featureStyles.cardText}>{shootingType.description}</p>

              <div className={styles.metaRow}>
                <span className={styles.metaChip}>
                  <Timer size={14} />
                  {shootingType.duration}분
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export default ShootingTypePage
