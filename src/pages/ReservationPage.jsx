import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from '../styles/ReservationPage.module.css'
import ReservationType from '../component/reservation/ReservationType'
import ReservationSchedule from '../component/reservation/ReservationSchedule'

const STEPS = ['TYPE', 'SCHEDULE', 'INFO', 'CONFIRM']

const ReservationPage = () => {

  // mode, schedule, info, confirm
  const [mode, setMode] =  useState(STEPS[0])
  const [form, setForm] = useState(
    {
      "type": null,
      "date": "",
      "headcount": 1,
      "startTime": "",
      "endTime": "",
      "name": "",
      "phone": "",
      "visitPath": "",
      "requestMessage": "",
      "termsAgreed": false
    }
  )

  // 이전 버튼 클릭
  const clickPrevMode = () => {
    const currentIndex = STEPS.indexOf(mode)
    if (currentIndex > 0) setMode(STEPS[currentIndex - 1])
  }

  // 다음 버튼 클릭
  const clickNextMode = () => {
    const currentIndex = STEPS.indexOf(mode)
    if (currentIndex < STEPS.length - 1) setMode(STEPS[currentIndex + 1])
      

    console.log(form)
  }

  return (
    <div className={styles.layout}>
      <div className={styles.title}>예약하기</div>
      <div className={styles.content}>
        {
          mode === 'TYPE' && (
            <ReservationType
              form={form}
              setForm={setForm}
            />
          )
        }
        {
          mode === 'SCHEDULE' && (
            <ReservationSchedule
              form={form}
              setForm={setForm}
            />
          )
        }
      </div>
      <div className={`${styles.btnGroup} ${mode === 'TYPE' ? styles.btnGroupEnd : ''}`}>
        {
          mode !== 'TYPE' && (
            <button className={styles.prevBtn} onClick={clickPrevMode}>
              <ChevronLeft size={16} />
              이전
            </button>
          ) 
        }
        <button className={styles.nextBtn} onClick={clickNextMode}>
          <ChevronRight size={16}/>
          다음
        </button>
      </div>
    </div>
  )
}

export default ReservationPage
