import { CalendarClock, PencilLine, Sparkles, Trash2 } from 'lucide-react'
import styles from '../../styles/FaqManagementPage.module.css'

const TermsDetail = ({ terms, onEdit, onDelete }) => {
  return (
    <div className={styles.detailStack}>
      <div className={styles.detailHero}>
        <h2 className={styles.panelTitle}>{terms.title}</h2>

        <div className={styles.actionGroup}>
          <button className={styles.primaryButton} type="button" onClick={onEdit}>
            <PencilLine size={16} />
            수정
          </button>
          <button className={styles.dangerButton} type="button" onClick={onDelete}>
            <Trash2 size={16} />
            삭제
          </button>
        </div>
      </div>

      <article className={styles.contentCard}>
        <h3 className={styles.contentTitle}>약관 내용</h3>
        <p className={styles.contentBody}>
          {terms.content || '등록된 약관 내용이 없습니다.'}
        </p>
      </article>

      <div className={styles.metaGrid}>
        <article className={styles.metaCard}>
          <div className={styles.metaIcon}>
            <Sparkles size={16} />
          </div>
          <span className={styles.metaLabel}>동의 유형</span>
          <strong className={styles.metaValue}>{terms.isRequired ? '필수' : '선택'}</strong>
        </article>

        <article className={styles.metaCard}>
          <div className={styles.metaIcon}>
            <CalendarClock size={16} />
          </div>
          <span className={styles.metaLabel}>생성 일시</span>
          <strong className={styles.metaValueWide}>{terms.createdAt}</strong>
        </article>
      </div>
    </div>
  )
}

export default TermsDetail
