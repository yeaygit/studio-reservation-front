import React from 'react'
import {
  CircleDollarSign,
  Hash,
  PencilLine,
  Timer,
  Trash2,
} from 'lucide-react'
import styles from '../../styles/PhotoTypeSettingPage.module.css'
import { formatPrice } from '../../utils/formatSetting'

const PhotoTypeDetail = ({ shootingType, onEdit, onDelete }) => (
  <div className={styles.detailStack}>
    <div className={styles.detailHero}>
      <div className={styles.titleBlock}>
        <div className={styles.detailBadgeRow}>
          <span className={styles.codeBadge}>{shootingType.code || 'NO-CODE'}</span>
        </div>
        <h2 className={styles.panelTitle}>{shootingType.label}</h2>
      </div>

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
      <h3 className={styles.contentTitle}>상세 설명</h3>
      <p className={styles.contentBody}>
        {shootingType.description || '등록된 설명이 없습니다.'}
      </p>
    </article>

    <div className={styles.metaGrid}>
      <article className={styles.metaCard}>
        <div className={styles.metaIcon}>
          <Timer size={16} />
        </div>
        <span className={styles.metaLabel}>촬영 시간</span>
        <strong className={styles.metaValue}>{shootingType.duration}분</strong>
      </article>

      <article className={styles.metaCard}>
        <div className={styles.metaIcon}>
          <CircleDollarSign size={16} />
        </div>
        <span className={styles.metaLabel}>금액</span>
        <strong className={styles.metaValue}>{formatPrice(shootingType.price)}</strong>
      </article>

      <article className={styles.metaCard}>
        <div className={styles.metaIcon}>
          <Hash size={16} />
        </div>
        <span className={styles.metaLabel}>노출 순서</span>
        <strong className={styles.metaValue}>
          {shootingType.sortOrder ?? '미지정'}
        </strong>
      </article>

    </div>
  </div>
)

export default PhotoTypeDetail
