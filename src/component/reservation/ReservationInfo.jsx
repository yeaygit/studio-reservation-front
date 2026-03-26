import React from 'react'
import styles from '../../styles/ReservationPage.module.css'
import { Check } from 'lucide-react'

const VISIT_PATH_OPTIONS = [
  { value: '',            label: '선택해주세요' },
  { value: 'instagram',  label: '인스타그램' },
  { value: 'naver',      label: '네이버 검색' },
  { value: 'kakao',      label: '카카오맵' },
  { value: 'friend',     label: '지인 추천' },
  { value: 'revisit',    label: '재방문' },
  { value: 'other',      label: '기타' },
]

// 010-0000-0000 포맷
const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length < 4) return digits
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

const ReservationInfo = ({form, setForm}) => {

  const changeFormValue = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const changePhoneFormat = (e) => {
    setForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }))
  }

  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.step}>03</span>
        <h2 className={styles.sectionTitle}>예약 정보를 입력해주세요</h2>
      </div>
      <div className={styles.infoLayout}>
        <div className={styles.infoForm}>
          {/* 이름 */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              이름 <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.fieldInput}
              type="text"
              name="name"
              value={form.name}
              onChange={changeFormValue}
              placeholder="홍길동"
              autoComplete="name"
            />
          </div>

          {/* 연락처 */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              연락처 <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.fieldInput}
              type="tel"
              name="phone"
              value={form.phone}
              onChange={changePhoneFormat}
              placeholder="010-0000-0000"
              autoComplete="tel"
            />
          </div>

          {/* 방문 계기 */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              방문 계기 <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrap}>
              <select
                className={styles.fieldSelect}
                name="visitPath"
                value={form.visitPath}
                onChange={changeFormValue}
              >
                {VISIT_PATH_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <svg className={styles.selectArrow} width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* 요청사항 */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              요청사항
              <span className={styles.fieldOptional}>선택</span>
            </label>
            <textarea
              className={styles.fieldTextarea}
              name="requestMessage"
              value={form.requestMessage}
              onChange={changeFormValue}
              placeholder="촬영 시 요청사항이 있으면 자유롭게 작성해주세요."
              rows={4}
            />
          </div>

          {/* 이용약관 */}
          <div className={styles.termsRow}>
            <button
              type="button"
              className={`${styles.checkbox} ${form.termsAgreed ? styles.checkboxChecked : ''}`}
              onClick={() => setForm(prev => ({ ...prev, termsAgreed: !prev.termsAgreed }))}
              aria-label="이용약관 동의"
            >
              {form.termsAgreed && <Check size={11} strokeWidth={3} />}
            </button>
            <span className={styles.termsText}>
              <button type="button" className={styles.termsLink}>이용약관</button>
              에 동의합니다 <span className={styles.required}>*</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReservationInfo
