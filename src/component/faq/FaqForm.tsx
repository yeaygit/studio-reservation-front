import { ArrowLeft, Sparkles } from 'lucide-react'
import styles from '../../styles/FaqManagementPage.module.css'
import type { ChangeEventHandler, FormEventHandler } from 'react'
import type { CrudPageMode } from '../../constants/pageModes'
import type { FaqFormState } from '../../types/content'

interface FaqFormProps {
  mode: CrudPageMode
  form: FaqFormState
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onCancel: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

const FaqForm = ({
  mode,
  form,
  onChange,
  onCancel,
  onSubmit,
}: FaqFormProps) => {
  const isCreateMode = mode === 'create'

  return (
    <form className={styles.editorCard} onSubmit={onSubmit}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>{isCreateMode ? '새 FAQ 추가' : 'FAQ 수정'}</h2>
          <p className={styles.panelDescription}>
            {isCreateMode
              ? '질문과 답변을 먼저 저장한 뒤, 수정 화면에서 순서를 조정하세요.'
              : '질문 문구와 답변, 노출 순서를 함께 조정할 수 있습니다.'}
          </p>
        </div>

        <button className={styles.secondaryButton} type="button" onClick={onCancel}>
          <ArrowLeft size={16} />
          돌아가기
        </button>
      </div>

      <div className={`${styles.formGrid} ${isCreateMode ? styles.formGridSingle : ''}`}>
        <label className={styles.field}>
          <span>질문</span>
          <input
            className={styles.input}
            type="text"
            name="question"
            value={form.question}
            onChange={onChange}
            placeholder="예: 예약 변경은 언제까지 가능한가요?"
          />
        </label>

        {!isCreateMode && (
          <label className={styles.field}>
            <span>노출 순서</span>
            <input
              className={styles.input}
              type="number"
              min="0"
              step="1"
              name="sortOrder"
              value={form.sortOrder}
              onChange={onChange}
              placeholder="예: 2"
            />
          </label>
        )}
      </div>

      <label className={styles.field}>
        <span>답변</span>
        <textarea
          className={styles.textarea}
          name="answer"
          value={form.answer}
          onChange={onChange}
          placeholder="고객에게 보여줄 답변을 입력해주세요."
        />
      </label>

      <div className={styles.editorFooter}>
        <div className={styles.helperBlock}>
          <Sparkles size={16} />
          <span>줄바꿈을 유지해서 안내 문구를 자연스럽게 작성할 수 있습니다.</span>
        </div>

        <div className={styles.actionGroup}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={onCancel}
          >
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

export default FaqForm
