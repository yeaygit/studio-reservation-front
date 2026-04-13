import styles from '../../styles/ReservationPage.module.css'
import { Check, Clock, Users } from 'lucide-react'
import type { ReservationTypeItem, ReservationTypeProps } from '../../types/reservation'

const ReservationType = ({ form, setForm, typeList }: ReservationTypeProps) => {
  const changeType = (type: ReservationTypeItem) => {
    setForm((previous) => {
      if (previous.type === type.code) return previous

      return {
        ...previous,
        type: type.code,
        startTime: '',
        endTime: '',
      }
    })
  }

  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.step}>01</span>
        <h2 className={styles.sectionTitle}>촬영 유형을 선택해주세요</h2>
      </div>

      <div className={styles.typeGrid}>
        {typeList.map((type) => {
          const isSelected = form.type === type.code
          return (
            <button
              key={type.id}
              className={`${styles.typeCard} ${isSelected ? styles.typeCardSelected : ''}`}
              onClick={() => changeType(type)}
              type="button"
            >
              {/* 선택 체크 */}
              <div className={`${styles.typeCheck} ${isSelected ? styles.typeCheckVisible : ''}`}>
                <Check size={12} strokeWidth={2.5} />
              </div>

              {/* 상단 */}
              <div className={styles.typeCardTop}>
                <span className={styles.typeLabel}>{type.label}</span>
                <span className={styles.typePrice}>
                  {type.price.toLocaleString()}원
                </span>
              </div>

              {/* 설명 */}
              <p className={styles.typeDesc}>{type.description}</p>

              {/* 하단 메타 */}
              <div className={styles.typeMeta}>
                <span className={styles.typeMetaItem}>
                  <Clock size={12} />
                  {type.duration}분
                </span>
                <span className={styles.typeMetaItem}>
                  <Users size={12} />
                  1인
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ReservationType
