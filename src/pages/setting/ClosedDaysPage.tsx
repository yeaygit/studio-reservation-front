import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { CalendarDays, Plus, Repeat, Trash2 } from 'lucide-react'
import DatePicker from '../../component/common/DatePicker.tsx'
import SelectBox from '../../component/common/SelectBox.tsx'
import YearSelect from '../../component/common/YearSelect.tsx'
import customAxios from '../../utils/customAxios'
import styles from '../../styles/ClosedDaysPage.module.css'
import type { ClosedDay, ClosedDayFormState, ClosedDayType } from '../../types/settings'
import { getApiErrorMessage } from '../../utils/apiError'

const CLOSED_DAY_TYPES = {
  SPECIFIC: 'SPECIFIC',
  ANNUAL: 'ANNUAL',
} as const

const TYPE_OPTIONS: Array<{ value: ClosedDayType; label: string; helper: string }> = [
  {
    value: CLOSED_DAY_TYPES.SPECIFIC,
    label: '특정일 휴무',
    helper: '선택한 연도 안에서 하루만 쉬는 날을 등록합니다.',
  },
  {
    value: CLOSED_DAY_TYPES.ANNUAL,
    label: '매년 반복 휴무',
    helper: '선택한 월/일을 매년 같은 날짜로 반복 등록합니다.',
  },
]

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1

  return {
    value: String(month),
    label: `${month}월`,
  }
})

const CURRENT_DATE = new Date()
const CURRENT_YEAR = CURRENT_DATE.getFullYear()

const getDaysInMonth = (year: number, month: number): number => {
  const safeYear = Number.isFinite(year) ? year : CURRENT_YEAR
  const safeMonth = Number.isFinite(month) ? month : 1
  const normalizedMonth = Math.min(Math.max(safeMonth, 1), 12)

  return new Date(safeYear, normalizedMonth, 0).getDate()
}

const createDayOptions = (year: number, month: number) =>
  Array.from({ length: getDaysInMonth(year, month) }, (_, index) => {
    const day = index + 1

    return {
      value: String(day),
      label: `${day}일`,
    }
  })

const createInitialForm = (
  year: number = CURRENT_YEAR,
  type: ClosedDayType = CLOSED_DAY_TYPES.SPECIFIC,
): ClosedDayFormState => {
  const month = CURRENT_DATE.getMonth() + 1
  const day = Math.min(CURRENT_DATE.getDate(), getDaysInMonth(year, month))

  return {
    type,
    specificDate: '',
    annualMonth: String(month),
    annualDay: String(day),
  }
}

const parseIsoDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) {
    return null
  }

  const [year, month, day] = String(dateString).split('-').map(Number)

  if (![year, month, day].every(Number.isFinite)) {
    return null
  }

  return new Date(year, month - 1, day)
}

const formatDisplayDate = (dateString: string | null | undefined): string => {
  const parsedDate = parseIsoDate(dateString)

  if (!parsedDate) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(parsedDate)
}

const formatRuleLabel = (closedDay: ClosedDay): string => {
  if (closedDay.type === CLOSED_DAY_TYPES.ANNUAL) {
    return `매년 ${closedDay.annualMonth}월 ${closedDay.annualDay}일 반복`
  }

  return '선택한 날짜에만 적용되는 휴무일'
}

const sortClosedDays = (closedDays: ClosedDay[]): ClosedDay[] =>
  [...closedDays].sort((left, right) => {
    const leftDate = left.closedDate ?? ''
    const rightDate = right.closedDate ?? ''

    if (leftDate === rightDate) {
      return (left.id ?? 0) - (right.id ?? 0)
    }

    return leftDate.localeCompare(rightDate)
  })

const ClosedDaysPage = () => {
  const [selectedYear, setSelectedYear] = useState<string>(String(CURRENT_YEAR))
  const [form, setForm] = useState<ClosedDayFormState>(() => createInitialForm(CURRENT_YEAR))
  const [closedDays, setClosedDays] = useState<ClosedDay[]>([])

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  const yearNumber = Number(selectedYear)
  const annualDayOptions = createDayOptions(yearNumber, Number(form.annualMonth))
  const specificCount = closedDays.filter(({ type }) => type === CLOSED_DAY_TYPES.SPECIFIC).length
  const annualCount = closedDays.filter(({ type }) => type === CLOSED_DAY_TYPES.ANNUAL).length

  const loadClosedDays = async (yearValue: string): Promise<void> => {
    setErrorMessage('')

    try {
      const response = await customAxios.get<ClosedDay[]>('/admin/settings/closed-days', {
        params: {
          year: Number(yearValue),
        },
      })

      const normalizedClosedDays = Array.isArray(response.data) ? sortClosedDays(response.data) : []
      setClosedDays(normalizedClosedDays)
    } catch (error: unknown) {
      setClosedDays([])
      setErrorMessage(getApiErrorMessage(error, '휴무일 목록을 불러오지 못했습니다.'))
    } 
  }

  useEffect(() => {
    void loadClosedDays(selectedYear)
  }, [selectedYear])

  const handleYearChange = ({ target: { value } }: ChangeEvent<HTMLSelectElement>) => {
    const nextYear = value

    setSelectedYear(nextYear)
    setSuccessMessage('')
    setErrorMessage('')
    setForm((previous) => {
      const nextForm = { ...previous }

      if (
        previous.type === CLOSED_DAY_TYPES.SPECIFIC &&
        previous.specificDate &&
        !previous.specificDate.startsWith(`${nextYear}-`)
      ) {
        nextForm.specificDate = ''
      }

      if (previous.type === CLOSED_DAY_TYPES.ANNUAL) {
        const maximumDay = getDaysInMonth(Number(nextYear), Number(previous.annualMonth))
        const annualDay = Number(previous.annualDay)

        if (annualDay > maximumDay) {
          nextForm.annualDay = String(maximumDay)
        }
      }

      return nextForm
    })
  }

  const handleFormChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((previous) => {
      if (name === 'type') {
        return {
          ...previous,
          type: value as ClosedDayType,
          specificDate: value === CLOSED_DAY_TYPES.SPECIFIC ? previous.specificDate : '',
        }
      }

      if (name === 'annualMonth') {
        const nextMaximumDay = getDaysInMonth(yearNumber, Number(value))
        const nextAnnualDay = Math.min(Number(previous.annualDay), nextMaximumDay)

        return {
          ...previous,
          annualMonth: value,
          annualDay: String(nextAnnualDay),
        }
      }

      return {
        ...previous,
        [name]: value,
      }
    })
  }

  const validateForm = (): string => {
    if (form.type === CLOSED_DAY_TYPES.SPECIFIC) {
      if (!form.specificDate) {
        return '특정일 휴무는 날짜를 선택해 주세요.'
      }

      if (!form.specificDate.startsWith(`${selectedYear}-`)) {
        return `${selectedYear}년 안의 날짜만 선택할 수 있습니다.`
      }

      return ''
    }

    const annualMonth = Number(form.annualMonth)
    const annualDay = Number(form.annualDay)

    if (!Number.isFinite(annualMonth) || !Number.isFinite(annualDay)) {
      return '반복 휴무는 월과 일을 모두 선택해 주세요.'
    }

    if (annualDay > getDaysInMonth(yearNumber, annualMonth)) {
      return `${selectedYear}년 기준 ${annualMonth}월에는 ${annualDay}일이 없습니다.`
    }

    return ''
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')

    const validationMessage = validateForm()

    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    const payload: {
      type: ClosedDayType
      specificDate: string | null
      annualMonth: number | null
      annualDay: number | null
    } =
      form.type === CLOSED_DAY_TYPES.SPECIFIC
        ? {
            type: CLOSED_DAY_TYPES.SPECIFIC,
            specificDate: form.specificDate,
            annualMonth: null,
            annualDay: null,
          }
        : {
            type: CLOSED_DAY_TYPES.ANNUAL,
            specificDate: null,
            annualMonth: Number(form.annualMonth),
            annualDay: Number(form.annualDay),
          }

    try {
      await customAxios.post('/admin/settings/closed-days', payload)
      setForm(createInitialForm(yearNumber, form.type))
      setSuccessMessage('휴무일을 등록했습니다.')
      await loadClosedDays(selectedYear)
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, '휴무일을 등록하지 못했습니다.'))
    }
  }

  const handleDelete = async (closedDayId: number): Promise<void> => {
    const shouldDelete = window.confirm('이 휴무일을 삭제할까요? 삭제 시 비활성화 처리됩니다.')

    if (!shouldDelete) {
      return
    }

    setSuccessMessage('')
    setErrorMessage('')

    try {
      await customAxios.delete(`/admin/settings/closed-days/${closedDayId}`)
      setSuccessMessage('휴무일을 삭제했습니다.')
      await loadClosedDays(selectedYear)
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, '휴무일을 삭제하지 못했습니다.'))
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.title}>휴일 관리</h1>
          <p className={styles.description}>조회 연도 기준으로 임시 휴무일과 반복 휴무일을 함께 관리합니다.</p>
          <p className={styles.description}>
            조회 연도는 목록 조회와 반복 휴무 계산에 항상 함께 사용됩니다. 특정일 휴무는 선택한
            연도 안에서만 등록할 수 있습니다.
          </p>
        </div>
        <div className={styles.heroStats}>
          <article className={styles.heroStatCard}>
            <span className={styles.statLabel}>{selectedYear}년 휴무일</span>
            <strong className={styles.statValue}>{closedDays.length}건</strong>
            <p className={styles.statHelper}>선택한 연도 기준으로 실제 적용되는 휴무일 수입니다.</p>
          </article>
          <article className={styles.heroStatCard}>
            <span className={styles.statLabel}>특정일 휴무</span>
            <strong className={`${styles.statValue} ${styles.statAccent}`}>{specificCount}건</strong>
            <p className={styles.statHelper}>하루만 적용되는 임시 휴무일입니다.</p>
          </article>
          <article className={styles.heroStatCard}>
            <span className={styles.statLabel}>매년 반복 휴무</span>
            <strong className={styles.statValue}>{annualCount}건</strong>
            <p className={styles.statHelper}>월/일 기준으로 해마다 반복되는 휴무일입니다.</p>
          </article>
        </div>
      </div>

      {successMessage.trim() !== '' && (
        <div className={styles.feedbackSuccess} role="status">
          {successMessage}
        </div>
      )}

      {errorMessage.trim() !== '' && (
        <div className={styles.feedbackError} role="alert">
          {errorMessage}
        </div>
      )}

      <div className={styles.pageToolbar}>
        <div className={styles.pageToolbarControls}>
          <YearSelect
            label="조회 기준 연도"
            value={selectedYear}
            onChange={handleYearChange}
            startYear={CURRENT_YEAR - 2}
            endYear={CURRENT_YEAR + 5}
          />
        </div>

        <div className={styles.toolbarSummary}>
          <span className={styles.summaryChip}>
            <CalendarDays size={14} />
            총 {closedDays.length}건
          </span>
          <span className={styles.summaryChip}>
            <CalendarDays size={14} />
            특정일 {specificCount}건
          </span>
          <span className={styles.summaryChip}>
            <Repeat size={14} />
            반복 {annualCount}건
          </span>
        </div>
      </div>

      <div className={styles.workspace}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>{selectedYear}년 휴무일 목록</h2>
            <p className={styles.panelDescription}>
              조회 연도 필터를 바꾸면 특정일은 해당 연도 데이터만, 반복 휴무는 그 연도에
              계산된 날짜로 다시 보여줍니다.
            </p>
            <p className={styles.metaText}>
              현재 목록은 상단의 {selectedYear}년 필터를 기준으로 정렬되어 있습니다.
            </p>
          </div>
          <div className={styles.listBody}>
            {closedDays.length === 0 ? (
              <div className={styles.emptyState}>
                <CalendarDays size={18} />
                <p className={styles.metaText}>
                  {selectedYear}년에 적용되는 휴무일이 없습니다. 오른쪽에서 첫 휴무일을
                  등록해보세요.
                </p>
              </div>
            ) : (
              closedDays.map((closedDay) => {
                const isSpecific = closedDay.type === CLOSED_DAY_TYPES.SPECIFIC

                return (
                  <article key={closedDay.id} className={styles.closedDayCard}>
                    <div className={styles.cardTop}>
                      <div className={styles.closedDayMeta}>
                        <div className={styles.cardBadgeRow}>
                          <span
                            className={`${styles.typeBadge} ${
                              isSpecific ? styles.typeSpecific : styles.typeAnnual
                            }`}
                          >
                            {isSpecific ? '특정일' : '매년 반복'}
                          </span>
                        </div>

                        <strong className={styles.dateValue}>
                          {formatDisplayDate(closedDay.closedDate)}
                        </strong>
                        <p className={styles.ruleText}>{formatRuleLabel(closedDay)}</p>
                      </div>

                      <button
                        className={styles.deleteButton}
                        type="button"
                        onClick={() => handleDelete(closedDay.id)}
                      >
                        <Trash2 size={16} />
                        삭제
                      </button>
                    </div>

                    <div className={styles.cardMeta}>
                      <div className={styles.closedDayMeta}>
                        <span className={styles.metaLabel}>적용 날짜</span>
                        <span className={styles.metaValue}>{closedDay.closedDate ?? '-'}</span>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>휴무일 추가</h2>
            <p className={styles.panelDescription}>
              현재 선택된 {selectedYear}년을 기준으로 등록합니다.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.typeSwitch}>
              <span className={styles.inputLabel}>휴무 타입</span>
              <div className={styles.typeButtonGroup}>
                {TYPE_OPTIONS.map((option) => {
                  const isActive = form.type === option.value

                  return (
                    <button
                      key={option.value}
                      className={`${styles.typeButton} ${isActive ? styles.typeButtonActive : ''}`}
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          type: option.value,
                          specificDate:
                            option.value === CLOSED_DAY_TYPES.SPECIFIC ? previous.specificDate : '',
                        }))
                      }
                    >
                      <span className={styles.typeLabel}>{option.label}</span>
                      <span className={styles.typeHelper}>{option.helper}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {form.type === CLOSED_DAY_TYPES.SPECIFIC ? (
              <DatePicker
                label="휴무 날짜"
                name="specificDate"
                value={form.specificDate}
                min={`${selectedYear}-01-01`}
                max={`${selectedYear}-12-31`}
                onChange={handleFormChange}
                hint={`${selectedYear}년 안에서만 선택할 수 있습니다.`}
                containerClassName={styles.inputField}
                labelClassName={styles.inputLabel}
                hintClassName={styles.inputHint}
              />
            ) : (
              <div className={styles.formGrid}>
                <SelectBox
                  label="반복 월"
                  name="annualMonth"
                  value={form.annualMonth}
                  options={MONTH_OPTIONS}
                  onChange={handleFormChange}
                />
                <SelectBox
                  label="반복 일"
                  name="annualDay"
                  value={form.annualDay}
                  options={annualDayOptions}
                  onChange={handleFormChange}
                />
              </div>
            )}
            <div className={styles.submitRow}>
              <button className={styles.primaryButton} type="submit">
                <Plus size={16} />
                휴무일 추가
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  )
}

export default ClosedDaysPage
