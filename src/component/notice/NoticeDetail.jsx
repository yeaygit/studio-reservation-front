import {
  BellRing,
  CalendarClock,
  CalendarRange,
  PencilLine,
  Trash2,
} from 'lucide-react'
import styles from '../../styles/FaqManagementPage.module.css'


const NoticeDetail = ({ notice, onEdit, onDelete }) => {
  return (
    <div className={styles.detailStack}>
      <div className={styles.detailHero}>
        <h2 className={styles.panelTitle}>{notice.title}</h2>

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
        <h3 className={styles.contentTitle}>공지 내용</h3>
        <p className={styles.contentBody}>{notice.content || '등록된 공지 내용이 없습니다.'}</p>
      </article>

      <div className={styles.metaGrid}>
        <article className={styles.metaCard}>
          <div className={styles.metaIcon}>
            <BellRing size={16} />
          </div>
          <span className={styles.metaLabel}>팝업 노출</span>
          <strong className={styles.metaValue}>{notice.isPopup ? '사용' : '미사용'}</strong>
        </article>
        {
          notice.isPopup && (
            <article className={styles.metaCard}>
              <div className={styles.metaIcon}>
                <CalendarRange size={16} />
              </div>
              <span className={styles.metaLabel}>팝업 기간</span>
              <strong className={styles.metaValueWide}>{`${notice.popupStartDate} ~ ${notice.popupEndDate}`}</strong>
            </article>
          )
        }

        <article className={styles.metaCard}>
          <div className={styles.metaIcon}>
            <CalendarClock size={16} />
          </div>
          <span className={styles.metaLabel}>생성 일시</span>
          <strong className={styles.metaValueWide}>{notice.createdAt}</strong>
        </article>
      </div>
    </div>
  )
}

export default NoticeDetail
