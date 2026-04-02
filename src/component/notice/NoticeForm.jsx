import { ArrowLeft, Sparkles } from 'lucide-react'
import DatePicker from '../common/DatePicker'
import RadioGroup from '../common/RadioGroup'
import layoutStyles from '../../styles/NoticeForm.module.css'
import styles from '../../styles/FaqManagementPage.module.css'

const POPUP_OPTIONS = [
  {
    value: 'false',
    label: '미사용',
  },
  {
    value: 'true',
    label: '사용',
  },
]

const NoticeForm = ({
  mode,
  form,
  onChange,
  onCancel,
  onSubmit,
}) => {
  const isCreateMode = mode === 'create'

  return (
    <form className={styles.editorCard} onSubmit={onSubmit}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>{isCreateMode ? '새 공지 추가' : '공지사항 수정'}</h2>
          <p className={styles.panelDescription}>
            제목과 내용을 입력하고 팝업 노출 여부와 기간을 함께 설정할 수 있습니다.
          </p>
        </div>

        <button className={styles.secondaryButton} type="button" onClick={onCancel}>
          <ArrowLeft size={16} />
          돌아가기
        </button>
      </div>

      <label className={styles.field}>
        <span>제목</span>
        <input
          className={styles.input}
          type="text"
          name="title"
          value={form.title}
          onChange={onChange}
          maxLength={200}
          placeholder="공지 제목을 입력해 주세요."
        />
      </label>

      <RadioGroup
        label="팝업 노출"
        name="isPopup"
        value={String(form.isPopup)}
        options={POPUP_OPTIONS}
        onChange={onChange}
      />

      {form.isPopup && (
        <div className={layoutStyles.splitGrid}>
          <DatePicker
            label="팝업 시작일"
            name="popupStartDate"
            value={form.popupStartDate}
            onChange={onChange}
            max={form.popupEndDate || undefined}
          />

          <DatePicker
            label="팝업 종료일"
            name="popupEndDate"
            value={form.popupEndDate}
            onChange={onChange}
            min={form.popupStartDate || undefined}
          />
        </div>
      )}

      <label className={styles.field}>
        <span>내용</span>
        <textarea
          className={styles.textarea}
          name="content"
          value={form.content}
          onChange={onChange}
          placeholder="공지 본문을 입력해 주세요. 비워 두면 제목만 등록됩니다."
        />
      </label>

      <div className={styles.editorFooter}>
        <div className={styles.actionGroup}>
          <button className={styles.secondaryButton} type="button" onClick={onCancel}>
            취소
          </button>
          <button className={styles.primaryButton} type="submit">
            저장
          </button>
        </div>
      </div>
    </form>
  )
}

export default NoticeForm
