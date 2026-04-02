import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from '../styles/ReservationPage.module.css'
import ReservationType from '../component/reservation/ReservationType'
import ReservationSchedule from '../component/reservation/ReservationSchedule'
import ReservationInfo from '../component/reservation/ReservationInfo'
import ReservationConfirm from '../component/reservation/ReservationConfirm'
import customAxios from '../utils/customAxios'

const STEPS = ['TYPE', 'SCHEDULE', 'INFO', 'CONFIRM']

const INITIAL_FORM = {
  type: null,
  date: '',
  headcount: 1,
  startTime: '',
  endTime: '',
  name: '',
  phone: '',
  visitPath: '',
  requestMessage: '',
  termsAgreed: false,
}

const ReservationPage = () => {
  const [mode, setMode] = useState(STEPS[0])
  const [form, setForm] = useState(INITIAL_FORM)
  const [typeList, setTypeList] = useState([]);

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
      if (!form.visitPath) return '방문 경로를 선택해 주세요.'
      if (!form.termsAgreed) return '이용약관에 동의해 주세요.'
    }

    return ''
  }

  const nextBlockMessage = getNextBlockMessage()
  const isNextDisabled = Boolean(nextBlockMessage)

  const clickPrevMode = () => {
    const currentIndex = STEPS.indexOf(mode)

    if (currentIndex > 0) {
      setMode(STEPS[currentIndex - 1])
    }
  }

  const clickNextMode = () => {
    if (isNextDisabled) {
      return
    }

    const currentIndex = STEPS.indexOf(mode)

    if (currentIndex < STEPS.length - 1) {
      setMode(STEPS[currentIndex + 1])
    }

    console.log(form)
  }

  const loadShootingTypes = async() => {
    try{
      const res = await customAxios.get(`/v1/settings/shooting-types`)
      setTypeList(res.data)
      return res.data
    }catch(err){
      console.log(err.response.data.errorMessage)
    }
  };

  useEffect(() => {
    void loadShootingTypes();
  }, [])

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

        {mode === 'INFO' && <ReservationInfo form={form} setForm={setForm} />}

        {mode === 'CONFIRM' && <ReservationConfirm />}
      </div>

      {nextBlockMessage && <p className={styles.stepMessage}>{nextBlockMessage}</p>}

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
          onClick={clickNextMode}
          disabled={isNextDisabled}
        >
          <ChevronRight size={16} />
          다음
        </button>
      </div>
    </div>
  )
}

export default ReservationPage
