import type { ChangeEvent } from 'react'
import styles from '../../styles/ReservationPage.module.css'
import { Check } from 'lucide-react'
import type { ReservationInfoProps } from '../../types/reservation'

const VISIT_PATH_OPTIONS = [
  { value: '', label: '선택해 주세요' },
  { value: 'instagram', label: '인스타그램' },
  { value: 'naver', label: '네이버 검색' },
  { value: 'kakao', label: '카카오톡' },
  { value: 'friend', label: '지인 추천' },
  { value: 'revisit', label: '재방문' },
  { value: 'other', label: '기타' },
]

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length < 4) return digits
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

const ReservationInfo = ({ form, setForm, termsList }: ReservationInfoProps) => {
  const changeFormValue = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const changePhoneFormat = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({
      ...previous,
      phone: formatPhone(event.target.value),
    }))
  }

  const toggleTermsAgreement = (termsId: number) => {
    setForm((previous) => {
      const isAgreed = previous.agreedTerms.includes(termsId)

      return {
        ...previous,
        agreedTerms: isAgreed
          ? previous.agreedTerms.filter((id) => id !== termsId)
          : [...previous.agreedTerms, termsId],
      }
    })
  }

  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.step}>03</span>
        <h2 className={styles.sectionTitle}>예약 정보를 입력해 주세요</h2>
      </div>
      <div className={styles.infoLayout}>
        <div className={styles.infoForm}>
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

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              연락처<span className={styles.required}>*</span>
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

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              방문 경로
              <span className={styles.fieldOptional}>선택</span>
            </label>
            <div className={styles.selectWrap}>
              <select
                className={styles.fieldSelect}
                name="visitPath"
                value={form.visitPath}
                onChange={changeFormValue}
              >
                {VISIT_PATH_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <svg className={styles.selectArrow} width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1 1l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

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
              placeholder="촬영 전 요청사항이 있으시면 자유롭게 작성해 주세요."
              rows={4}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              약관 동의 <span className={styles.required}>*</span>
            </label>

            {termsList.length > 0 ? (
              <div className={styles.termsList}>
                {termsList.map((terms) => {
                  const isAgreed = form.agreedTerms.includes(terms.id)

                  return (
                    <div key={terms.id} className={styles.termsRow}>
                      <button
                        type="button"
                        className={`${styles.checkbox} ${isAgreed ? styles.checkboxChecked : ''}`}
                        onClick={() => toggleTermsAgreement(terms.id)}
                        aria-label={`${terms.title} 동의`}
                      >
                        {isAgreed && <Check size={11} strokeWidth={3} />}
                      </button>

                      <div className={styles.termsContent}>
                        <span className={styles.termsTitle}>{terms.title}</span>
                        <span
                          className={`${styles.termsBadge} ${
                            terms.isRequired ? styles.termsBadgeRequired : styles.termsBadgeOptional
                          }`}
                        >
                          {terms.isRequired ? '필수' : '선택'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className={styles.slotPlaceholder}>표시할 약관이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReservationInfo
