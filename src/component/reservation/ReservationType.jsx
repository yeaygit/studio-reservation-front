import React, { useState } from 'react'
import styles from '../../styles/ReservationPage.module.css'
import { Check, Clock, Users } from 'lucide-react'

const ReservationType = ({form, setForm}) => {

  const [typeList, setTypeList] = useState(
    [
      {
        id: 1,
        code: 'id',
        label: '증명사진',
        duration: 30,
        min: 1,
        max: 1,
        description: '개인 증명사진입니다. 1명 촬영 가능합니다. 6장 인화해 드리고 상반신 사진 1장 같이 드립니다.',
        price: 45000
      },
      {
        id: 2,
        code: 'passport',
        label: '여권사진',
        duration: 30,
        min: 1,
        max: 1,
        description: '개인 여권사이즈 사진입니다. 1명 촬영 가능합니다. 6장 인화해 드리고 상반신 사진 1장 같이 드립니다.',
        price: 45000
      },
      {
        id: 3,
        code: 'idPassport',
        label: '증명 + 여권사진',
        duration: 30,
        min: 1,
        max: 1,
        description: '개인 증명 + 여권사이즈 사진입니다. 1명 촬영 가능합니다. 각 6장씩 인화해 드리고 상반신 사진 1장 같이 드립니다.',
        price: 55000
      },
      {
        id: 4,
        code: 'profile',
        label: '프로필',
        duration: 60,
        min: 1,
        max: 1,
        description: '개인 프로필 사진입니다. 1명 촬영 가능합니다. 상반신만 촬영해드리고 얼굴 위주 프로필 사진입니다. 컨셉 정해서 오시는 것을 추천드립니다. 사진 2장 선택 가능하고 인화해드립니다.',
        price: 60000
      },
    ]
  )

  const changeType = (type) => {
    setForm((prev) => ({ ...prev, type: type.code }))
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
                  {type.min === type.max ? `${type.min}인` : `${type.min}~${type.max}인`}
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
