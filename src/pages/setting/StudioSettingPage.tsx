import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import customAxios from '../../utils/customAxios'
import styles from '../../styles/StudioSettingPage.module.css'
import SelectBox from '../../component/common/SelectBox.tsx'
import TimePicker from '../../component/common/TimePicker.tsx'
import type {
  ClosedDayKey,
  StudioSettingFormState,
  StudioSettingResponse,
} from '../../types/settings'
import { getApiErrorMessage } from '../../utils/apiError'

const SLOT_UNIT_OPTIONS = [
  { value: 30, label: '30분' },
  { value: 60, label: '60분' },
]

const RESERVATION_OPEN_DAY_OPTIONS = Array.from({ length: 30 }, (_, index) => ({
  value: index + 1,
  label: `${index + 1}일`,
}))

const CLOSED_DAY_OPTIONS: Array<{ key: ClosedDayKey; label: string; shortLabel: string }> = [
  { key: 'closedMon', label: '월요일', shortLabel: '월' },
  { key: 'closedTue', label: '화요일', shortLabel: '화' },
  { key: 'closedWed', label: '수요일', shortLabel: '수' },
  { key: 'closedThu', label: '목요일', shortLabel: '목' },
  { key: 'closedFri', label: '금요일', shortLabel: '금' },
  { key: 'closedSat', label: '토요일', shortLabel: '토' },
  { key: 'closedSun', label: '일요일', shortLabel: '일' },
]

const STUDIO_FORM_KEYS: Array<keyof StudioSettingFormState> = [
  'openTime',
  'closeTime',
  'lunchStart',
  'lunchEnd',
  'slotUnit',
  'reservationOpenDays',
  'closedSun',
  'closedMon',
  'closedTue',
  'closedWed',
  'closedThu',
  'closedFri',
  'closedSat',
]

const INITIAL_FORM: StudioSettingFormState = {
  openTime: '',
  closeTime: '',
  lunchStart: '',
  lunchEnd: '',
  slotUnit: '30',
  reservationOpenDays: '30',
  closedSun: false,
  closedMon: false,
  closedTue: false,
  closedWed: false,
  closedThu: false,
  closedFri: false,
  closedSat: false,
}

const formatTimeValue = (value: string | number[] | null | undefined): string => {
  if (!value) {
    return ''
  }

  if (Array.isArray(value)) {
    const [hour = 0, minute = 0] = value
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  const [hour = '00', minute = '00'] = String(value).split(':')
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
}

const normalizeStudioSetting = (setting: StudioSettingResponse): StudioSettingFormState => ({
  openTime: formatTimeValue(setting?.openTime),
  closeTime: formatTimeValue(setting?.closeTime),
  lunchStart: formatTimeValue(setting?.lunchStart),
  lunchEnd: formatTimeValue(setting?.lunchEnd),
  slotUnit: String(setting?.slotUnit ?? INITIAL_FORM.slotUnit),
  reservationOpenDays: String(setting?.reservationOpenDays ?? INITIAL_FORM.reservationOpenDays),
  closedSun: Boolean(setting?.closedSun),
  closedMon: Boolean(setting?.closedMon),
  closedTue: Boolean(setting?.closedTue),
  closedWed: Boolean(setting?.closedWed),
  closedThu: Boolean(setting?.closedThu),
  closedFri: Boolean(setting?.closedFri),
  closedSat: Boolean(setting?.closedSat),
})

const areFormsEqual = (
  left: StudioSettingFormState | null,
  right: StudioSettingFormState | null,
): boolean =>
  STUDIO_FORM_KEYS.every((key) => left?.[key] === right?.[key])

const toMinutes = (value: string): number => {
  if (!value) {
    return Number.NaN
  }

  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}


const StudioSettingPage = () => {
  const [form, setForm] = useState<StudioSettingFormState>(INITIAL_FORM)
  const [savedForm, setSavedForm] = useState<StudioSettingFormState | null>(null)

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  const closedDays = CLOSED_DAY_OPTIONS.filter(({ key }) => form[key]).map(({ shortLabel }) => shortLabel)
  const closedDaySummary = closedDays.length > 0 ? closedDays.join(', ') : '없음'
  const hasUnsavedChanges = savedForm ? !areFormsEqual(form, savedForm) : false

  const clearMessages = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  useEffect(() => {
    const loadStudioSetting = async () => {
      clearMessages()

      try {
        const response = await customAxios.get<StudioSettingResponse>('/admin/settings/studio')
        const normalizedSetting = normalizeStudioSetting(response.data)

        setForm(normalizedSetting)
        setSavedForm(normalizedSetting)
      } catch (error: unknown) {
        setErrorMessage(getApiErrorMessage(error, '스튜디오 운영 설정을 불러오지 못했습니다.'))
      }
    }

    void loadStudioSetting()
  }, [])

  const handleFieldChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleClosedDayChange = ({ target: { name, checked } }: ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({
      ...previous,
      [name]: checked,
    }))
  }

  const handleReset = () => {
    if (!savedForm) {
      return
    }

    setForm(savedForm)
    setErrorMessage('')
    setSuccessMessage('저장된 설정 값으로 되돌렸습니다.')
  }

  const validateForm = (): string => {
    if (!form.openTime || !form.closeTime || !form.lunchStart || !form.lunchEnd) {
      return '운영 시간과 점심 시간을 모두 입력해 주세요.'
    }

    if (toMinutes(form.openTime) >= toMinutes(form.closeTime)) {
      return '운영 종료 시간은 운영 시작 시간보다 늦어야 합니다.'
    }

    if (toMinutes(form.lunchStart) >= toMinutes(form.lunchEnd)) {
      return '점심 종료 시간은 점심 시작 시간보다 늦어야 합니다.'
    }

    if (
      toMinutes(form.lunchStart) < toMinutes(form.openTime) ||
      toMinutes(form.lunchEnd) > toMinutes(form.closeTime)
    ) {
      return '점심 시간은 운영 시간 범위 안에서 설정해 주세요.'
    }

    return ''
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearMessages()

    const validationMessage = validateForm()

    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    try {
      const payload = {
        openTime: form.openTime,
        closeTime: form.closeTime,
        lunchStart: form.lunchStart,
        lunchEnd: form.lunchEnd,
        slotUnit: Number(form.slotUnit),
        reservationOpenDays: Number(form.reservationOpenDays),
        closedSun: form.closedSun,
        closedMon: form.closedMon,
        closedTue: form.closedTue,
        closedWed: form.closedWed,
        closedThu: form.closedThu,
        closedFri: form.closedFri,
        closedSat: form.closedSat,
      }

      const response = await customAxios.patch<StudioSettingResponse>('/admin/settings/studio', payload)
      const normalizedSetting = normalizeStudioSetting(response.data)

      setForm(normalizedSetting)
      setSavedForm(normalizedSetting)
      setSuccessMessage('스튜디오 운영 설정을 저장했습니다.')
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, '스튜디오 운영 설정을 저장하지 못했습니다.'))
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>예약 시간 설정</h1>
        <p className={styles.description}>운영 시간, 점심 시간, 예약 단위, 예약 오픈 일수와 정기 휴무 요일을 한 화면에서 관리합니다.</p>
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

      <section className={styles.formPanel}>
        <div className={styles.sectionTitleGroup}>
          <h2 className={styles.sectionTitle}>예약 시간 설정</h2>
          <p className={styles.sectionDescription}>
            운영 시간과 점심 시간, 예약 조건을 한 흐름 안에서 수정할 수 있습니다.
          </p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.settingSection}>
            <div className={styles.groupHeader}>
              <h3 className={styles.groupTitle}>운영 시간</h3>
              <p className={styles.groupDescription}>예약 가능한 시간의 시작과 종료를 설정합니다.</p>
            </div>

            <div className={styles.formGrid}>
              <TimePicker
                label="운영 시작 시간"
                name="openTime"
                value={form.openTime}
                onChange={handleFieldChange}
              />
              <TimePicker
                label="운영 종료 시간"
                name="closeTime"
                value={form.closeTime}
                onChange={handleFieldChange}
              />
            </div>
          </section>

          <section className={styles.settingSection}>
            <div className={styles.groupHeader}>
              <h3 className={styles.groupTitle}>점심 시간</h3>
              <p className={styles.groupDescription}>운영 시간 안에서 예약을 막을 점심 시간을 설정합니다.</p>
            </div>

            <div className={styles.formGrid}>
              <TimePicker
                label="점심 시작 시간"
                name="lunchStart"
                value={form.lunchStart}
                onChange={handleFieldChange}
              />
              <TimePicker
                label="점심 종료 시간"
                name="lunchEnd"
                value={form.lunchEnd}
                onChange={handleFieldChange}
              />
            </div>
          </section>

          <section className={styles.settingSection}>
            <div className={styles.groupHeader}>
              <h3 className={styles.groupTitle}>예약 설정</h3>
              <p className={styles.groupDescription}>예약 단위와 예약 오픈 일수를 선택합니다.</p>
            </div>

            <div className={styles.formGrid}>
              <SelectBox
                label="예약 단위"
                name="slotUnit"
                value={form.slotUnit}
                options={SLOT_UNIT_OPTIONS}
                onChange={handleFieldChange}
              />
              <SelectBox
                label="예약 오픈 일수"
                name="reservationOpenDays"
                value={form.reservationOpenDays}
                options={RESERVATION_OPEN_DAY_OPTIONS}
                onChange={handleFieldChange}
              />
            </div>
          </section>

          <fieldset className={styles.settingSection}>
            <legend className={styles.groupLegend}>정기 휴무</legend>
            <p className={styles.groupDescription}>
              {closedDays.length > 0
                ? `선택된 휴무 요일: ${closedDaySummary}`
                : '휴무 요일이 없다면 체크하지 않아도 됩니다.'}
            </p>

            <div className={styles.dayGrid}>
              {CLOSED_DAY_OPTIONS.map(({ key, label }) => (
                <label
                  key={key}
                  className={`${styles.dayChip} ${form[key] ? styles.dayChipActive : ''}`}
                  aria-label={label}
                  title={label}
                >
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    name={key}
                    checked={form[key]}
                    onChange={handleClosedDayChange}
                  />
                  <span className={styles.dayChipLabel}>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.noteCard}>
            <p className={styles.noteTitle}>저장 전 확인</p>
            <p className={styles.noteText}>운영 종료 시간은 운영 시작 시간보다 늦어야 합니다.</p>
            <p className={styles.noteText}>점심 시간은 운영 시간 안에서만 설정할 수 있습니다.</p>
            <p className={styles.noteText}>
              현재 변경 사항 {hasUnsavedChanges ? '있음' : '없음'}
            </p>
          </div>

          <div className={styles.formFooter}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
            >
              초기화
            </button>

            <button className={styles.primaryButton} type="submit">
              설정 저장
            </button>
          </div>
        </form>
      </section>
    </section>
  )
}

export default StudioSettingPage
