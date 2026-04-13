import {
  ArrowUpRight,
  CalendarClock,
  PencilLine,
  Trash2,
} from 'lucide-react'
import styles from '../../styles/FaqManagementPage.module.css'
import type { Faq } from '../../types/content'

interface FaqDetailProps {
  faq: Faq
  onEdit: () => void
  onDelete: () => void
}

const FaqDetail = ({ faq, onEdit, onDelete }: FaqDetailProps) => {

  return (
    <div className={styles.detailStack}>
      <div className={styles.detailHero}>
        <h2 className={styles.panelTitle}>{faq.question}</h2>

        <div className={styles.actionGroup}>
          <button className={styles.primaryButton} type="button" onClick={onEdit}>
            <PencilLine size={16} />
            수정
          </button>
          <button
            className={styles.dangerButton}
            type="button"
            onClick={onDelete}
          >
            <Trash2 size={16} />
            삭제
          </button>
        </div>
      </div>
      <article className={styles.contentCard}>
        <h3 className={styles.contentTitle}>답변 내용</h3>
        <p className={styles.contentBody}>{faq.answer}</p>
      </article>
      <div className={styles.metaGrid}>
        <article className={styles.metaCard}>
          <div className={styles.metaIcon}>
            <ArrowUpRight size={16} />
          </div>
          <span className={styles.metaLabel}>노출 순서</span>
          <strong className={styles.metaValue}>
            {faq.sortOrder}
          </strong>
        </article>

        <article className={styles.metaCard}>
          <div className={styles.metaIcon}>
            <CalendarClock size={16} />
          </div>
          <span className={styles.metaLabel}>생성 일시</span>
          <strong className={styles.metaValueWide}>
            {faq.createdAt}
          </strong>
        </article>
      </div>
    </div>
  )
}

export default FaqDetail
