import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { CRUD_PAGE_MODES as PHOTO_TYPE_MODES } from '../../constants/pageModes'
import styles from '../../styles/PhotoTypeSettingPage.module.css'

const PhotoTypeForm = ({
  mode,
  form,
  shootingType,
  onChange,
  onCancel,
  onSubmit,
}) => {
  const isCreateMode = mode === PHOTO_TYPE_MODES.CREATE

  return (
    <form className={styles.editorCard} onSubmit={onSubmit}>
      <div className={styles.panelHeader}>
        <div className={styles.titleBlock}>
          <h2 className={styles.panelTitle}>
            {isCreateMode ? '촬영 유형 등록' : '촬영 유형 수정'}
          </h2>
          <p className={styles.panelDescription}>
            {isCreateMode
              ? '새 촬영 상품을 등록하고 예약 화면에서 사용할 기본 정보를 설정합니다.'
              : '수정 API 기준으로 코드 외 항목만 편집할 수 있습니다.'}
          </p>
        </div>

        <button className={styles.secondaryButton} type="button" onClick={onCancel}>
          <ArrowLeft size={16} />
          돌아가기
        </button>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>코드</span>
          <input
            className={`${styles.input} ${!isCreateMode ? styles.readOnlyInput : ''}`}
            type="text"
            name="code"
            value={form.code}
            onChange={onChange}
            placeholder="예: profile-basic"
            disabled={!isCreateMode}
            readOnly={!isCreateMode}
          />
          <small className={styles.helperText}>
            {isCreateMode
              ? '등록 시 한 번 저장된 코드는 수정 API로 바꿀 수 없습니다.'
              : `${shootingType?.code ?? '-'} 코드는 읽기 전용입니다.`}
          </small>
        </label>

        <label className={styles.field}>
          <span>촬영 유형명</span>
          <input
            className={styles.input}
            type="text"
            name="label"
            value={form.label}
            onChange={onChange}
            placeholder="예: 기본 프로필 촬영"
          />
        </label>

        <label className={styles.field}>
          <span>촬영 시간(분)</span>
          <input
            className={styles.input}
            type="number"
            name="duration"
            min="1"
            step="1"
            inputMode="numeric"
            value={form.duration}
            onChange={onChange}
            placeholder="예: 30"
          />
        </label>

        <label className={styles.field}>
          <span>금액(원)</span>
          <input
            className={styles.input}
            type="number"
            name="price"
            min="0"
            step="1"
            inputMode="numeric"
            value={form.price}
            onChange={onChange}
            placeholder="예: 45000"
          />
        </label>

        {
          !isCreateMode && (
            <label className={styles.field}>
              <span>노출 순서</span>
              <input
                className={styles.input}
                type="number"
                name="sortOrder"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.sortOrder}
                onChange={onChange}
              />
            </label>
          )
        }
      </div>

      <label className={`${styles.field} ${styles.fieldWide}`}>
        <span>설명</span>
        <textarea
          className={styles.textarea}
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="예약 페이지나 내부 관리에서 참고할 설명을 입력해 주세요."
        />
      </label>

      <div className={styles.editorFooter}>

        <div className={styles.actionGroup}>
          <button className={styles.secondaryButton} type="button" onClick={onCancel}>
            취소
          </button>
          <button className={styles.primaryButton} type="submit">
            {isCreateMode ? '저장' : '수정'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PhotoTypeForm
