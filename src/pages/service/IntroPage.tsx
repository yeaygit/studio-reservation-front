import { useEffect, useState } from 'react'
import customAxios from '../../utils/customAxios'
import styles from '../../styles/IntroPage.module.css'
import { getApiErrorMessage } from '../../utils/apiError'

interface IntroFaq {
  id?: number
  question: string
  answer: string
}

const IntroPage = () => {
  const [faqs, setFaqs] = useState<IntroFaq[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')

  const getFaqs = async (): Promise<void> => {
    setErrorMessage('')
    try {
      const response = await customAxios.get<IntroFaq[]>('/v1/faq')
      setFaqs(response.data)
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, 'FAQ 정보를 불러오지 못했습니다.'))
    }
  }
  
  useEffect(() => {
    getFaqs()
  }, [])

  return (
    <div className={styles.page}>
      <section className={styles.faqSection} id="faq">
        <div className={styles.sectionHeader}>
          <div className={styles.copyGroup}>
            <p className={styles.sectionEyebrow}>FAQ</p>
            <h2 className={styles.sectionTitle}>Q. 질문 / A. 답변</h2>
            <p className={styles.sectionDescription}>
              고객분들이 가장 자주 확인하시는 문의를 순서대로 안내해드려요.
            </p>
          </div>
        </div>

        { errorMessage ? (
          <div className={`${styles.statusCard} ${styles.statusCardError}`}>{errorMessage}</div>
        ) : faqs.length === 0 ? (
          <div className={styles.statusCard}>등록된 FAQ가 아직 없습니다.</div>
        ) : (
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <article key={faq.id ?? faq.question} className={styles.faqCard}>
                <div className={styles.qaRow}>
                  <span className={`${styles.qaBadge} ${styles.questionBadge}`}>Q.</span>
                  <div className={styles.qaContent}>
                    <h3 className={styles.questionText}>{faq.question}</h3>
                  </div>
                </div>

                <div className={styles.answerRow}>
                  <span className={`${styles.qaBadge} ${styles.answerBadge}`}>A.</span>
                  <p className={styles.answerText}>{faq.answer}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default IntroPage
