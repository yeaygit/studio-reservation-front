import { ArrowLeft } from 'lucide-react'
import RadioGroup from '../common/RadioGroup'
import styles from '../../styles/FaqManagementPage.module.css'

const REQUIRED_OPTIONS = [
  {
    value: true,
    label: '필수'
  },
  {
    value: false,
    label: '선택'
  },
]

const TermsForm = ({
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
          <h2 className={styles.panelTitle}>{isCreateMode ? '약관 추가' : '약관 수정'}</h2>
          <p className={styles.panelDescription}>
            약관 제목과 동의 내용을 입력하고, 필수 여부를 함께 설정할 수 있습니다.
          </p>
        </div>

        <button className={styles.secondaryButton} type="button" onClick={onCancel}>
          <ArrowLeft size={16} />
          돌아가기
        </button>
      </div>

      <label className={styles.field}>
        <span>약관 제목</span>
        <input
          className={styles.input}
          type="text"
          name="title"
          value={form.title}
          onChange={onChange}
          maxLength={200}
          placeholder="예: 개인정보 수집 및 이용 동의"
        />
      </label>

      <RadioGroup
        label="동의 유형"
        name="isRequired"
        value={String(form.isRequired)}
        options={REQUIRED_OPTIONS}
        onChange={onChange}
      />

      <label className={styles.field}>
        <span>약관 내용</span>
        <textarea
          className={styles.textarea}
          name="content"
          value={form.content}
          onChange={onChange}
          placeholder="고객에게 노출할 약관 전문을 입력해 주세요."
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

export default TermsForm
