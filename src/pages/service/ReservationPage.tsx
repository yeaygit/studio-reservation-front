import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from '../../styles/ReservationPage.module.css'
import ReservationType from '../../component/reservation/ReservationType'
import ReservationSchedule from '../../component/reservation/ReservationSchedule'
import ReservationInfo from '../../component/reservation/ReservationInfo'
import ReservationConfirm from '../../component/reservation/ReservationConfirm'
import customAxios from '../../utils/customAxios'
import type {
  ReservationFormState,
  ReservationStep,
  ReservationTerm,
  ReservationTypeItem,
} from '../../types/reservation'
import { getApiErrorMessage } from '../../utils/apiError'
import { normalizePhoneDigits } from '../../utils/formatSetting'

const STEPS: ReservationStep[] = ['TYPE', 'SCHEDULE', 'INFO', 'CONFIRM']

const INITIAL_FORM: ReservationFormState = {
  type: null,
  date: '',
  headcount: 1,
  startTime: '',
  endTime: '',
  name: '',
  phone: '',
  visitPath: '',
  requestMessage: '',
  agreedTerms: [],
}

const ReservationPage = () => {
  const [mode, setMode] = useState<ReservationStep>(STEPS[0])
  const [form, setForm] = useState<ReservationFormState>(INITIAL_FORM)
  const [typeList, setTypeList] = useState<ReservationTypeItem[]>([])
  const [termsList, setTermsList] = useState<ReservationTerm[]>([])

  const [termsErrorMessage, setTermsErrorMessage] = useState<string>('')
  const [isSubmittingReservation, setIsSubmittingReservation] = useState<boolean>(false)
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>('')
  const [createdReservationId, setCreatedReservationId] = useState<number | string | null>(null)

  const requiredTerms = termsList.filter((terms) => terms.isRequired)
  const hasAgreedAllRequiredTerms =
    requiredTerms.length === 0 ||
    requiredTerms.every((terms) => form.agreedTerms.includes(terms.id))

  const getNextBlockMessage = () => {
    const phoneDigits = form.phone.replace(/\D/g, '')

    if (mode === 'TYPE' && !form.type) {
      return '촬영 유형을 선택해 주세요.'
    }

    if (mode === 'SCHEDULE') {
      if (!form.date) return '예약 날짜를 선택해 주세요.'
      if (!form.startTime || !form.endTime) return '예약 시간을 선택해 주세요.'
    }

    if (mode === 'INFO') {
      if (!form.name.trim()) return '이름을 입력해 주세요.'
      if (phoneDigits.length < 10) return '연락처를 입력해 주세요.'
      if (termsErrorMessage) return termsErrorMessage
      if (!hasAgreedAllRequiredTerms) return '필수 약관에 동의해 주세요.'
    }

    return ''
  }

  const nextBlockMessage = getNextBlockMessage()
  const isNextDisabled = Boolean(nextBlockMessage) || isSubmittingReservation

  const clickPrevMode = () => {
    if (mode === 'CONFIRM' || isSubmittingReservation) {
      return
    }

    const currentIndex = STEPS.indexOf(mode)

    if (currentIndex > 0) {
      setMode(STEPS[currentIndex - 1])
    }
  }

  const loadShootingTypes = async (): Promise<void> => {
    try {
      const response = await customAxios.get<ReservationTypeItem[]>('/v1/settings/shooting-types')
      setTypeList(response.data)
    } catch (error: unknown) {
      console.log(getApiErrorMessage(error, '촬영 유형 정보를 불러오지 못했습니다.'))
    }
  }

  const loadTerms = async (): Promise<void> => {
    setTermsErrorMessage('')

    try {
      const response = await customAxios.get<ReservationTerm[]>('/v1/terms')
      setTermsList(Array.isArray(response.data) ? response.data : [])
    } catch (error: unknown) {
      setTermsList([])
      setTermsErrorMessage(getApiErrorMessage(error, '약관 정보를 불러오지 못했습니다.'))
    }
  }

  const submitReservation = async (): Promise<void> => {
    setIsSubmittingReservation(true)
    setSubmitErrorMessage('')

    try {
      const response = await customAxios.post<{ reservationId?: number | string | null }>('/v1/reservations', {
        type: form.type,
        date: form.date,
        headcount: form.headcount,
        startTime: form.startTime,
        endTime: form.endTime,
        name: form.name.trim(),
        phone: normalizePhoneDigits(form.phone),
        visitPath: form.visitPath || null,
        requestMessage: form.requestMessage.trim() || null,
        agreedTerms: form.agreedTerms,
      })

      setCreatedReservationId(response.data?.reservationId ?? null)
      setMode('CONFIRM')
    } catch (error: unknown) {
      setSubmitErrorMessage(getApiErrorMessage(error, '예약 요청에 실패했습니다.'))
    } finally {
      setIsSubmittingReservation(false)
    }
  }

  const clickNextMode = async () => {
    if (isNextDisabled) {
      return
    }

    if (mode === 'INFO') {
      await submitReservation()
      return
    }

    const currentIndex = STEPS.indexOf(mode)

    if (currentIndex < STEPS.length - 1) {
      setMode(STEPS[currentIndex + 1])
    }
  }

  useEffect(() => {
    void loadShootingTypes()
    void loadTerms()
  }, [])

  const nextButtonLabel = isSubmittingReservation
    ? '예약 중...'
    : mode === 'INFO'
      ? '예약하기'
      : '다음'

  return (
    <div className={styles.layout}>
      <div className={styles.title}>예약하기</div>
      <div className={styles.content}>
        {mode === 'TYPE' && (
          <ReservationType form={form} setForm={setForm} typeList={typeList} />
        )}

        {mode === 'SCHEDULE' && (
          <ReservationSchedule form={form} setForm={setForm} typeList={typeList} />
        )}

        {mode === 'INFO' && (
          <ReservationInfo
            form={form}
            setForm={setForm}
            termsList={termsList}
          />
        )}

        {mode === 'CONFIRM' && (
          <ReservationConfirm reservationId={createdReservationId} />
        )}
      </div>

      {submitErrorMessage && <p className={styles.stepMessage}>{submitErrorMessage}</p>}
      {!submitErrorMessage && nextBlockMessage && <p className={styles.stepMessage}>{nextBlockMessage}</p>}

      {mode !== 'CONFIRM' && (
        <div className={`${styles.btnGroup} ${mode === 'TYPE' ? styles.btnGroupEnd : ''}`}>
          {mode !== 'TYPE' && (
            <button type="button" className={styles.prevBtn} onClick={clickPrevMode}>
              <ChevronLeft size={16} />
              이전
            </button>
          )}

          <button
            type="button"
            className={styles.nextBtn}
            onClick={() => void clickNextMode()}
            disabled={isNextDisabled}
          >
            <ChevronRight size={16} />
            {nextButtonLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export default ReservationPage
