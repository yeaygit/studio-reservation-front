import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from '../styles/ReservationPage.module.css'
import ReservationType from '../component/reservation/ReservationType'
import ReservationSchedule from '../component/reservation/ReservationSchedule'

const STEPS = ['TYPE', 'SCHEDULE', 'INFO', 'CONFIRM']

const ReservationPage = () => {

  const [typeList, setTypeList] = useState(
    [
      {
        id: 1,
        code: 'id',
        label: '증명사진',
        duration: 30,
        min: 1,
        max: 1,
        description: '개인 증명사진입니다. 1명 촬영 가능합니다. 6장 인화해 드리고 상반신 사진 1장 같이 드립니다.',
        price: 45000
      },
      {
        id: 2,
        code: 'passport',
        label: '여권사진',
        duration: 30,
        min: 1,
        max: 1,
        description: '개인 여권사이즈 사진입니다. 1명 촬영 가능합니다. 6장 인화해 드리고 상반신 사진 1장 같이 드립니다.',
        price: 45000
      },
      {
        id: 3,
        code: 'idPassport',
        label: '증명 + 여권사진',
        duration: 30,
        min: 1,
        max: 1,
        description: '개인 증명 + 여권사이즈 사진입니다. 1명 촬영 가능합니다. 각 6장씩 인화해 드리고 상반신 사진 1장 같이 드립니다.',
        price: 55000
      },
      {
        id: 4,
        code: 'profile',
        label: '프로필',
        duration: 60,
        min: 1,
        max: 1,
        description: '개인 프로필 사진입니다. 1명 촬영 가능합니다. 상반신만 촬영해드리고 얼굴 위주 프로필 사진입니다. 컨셉 정해서 오시는 것을 추천드립니다. 사진 2장 선택 가능하고 인화해드립니다.',
        price: 60000
      },
    ]
  )

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
              typeList={typeList}
            />
          )
        }
        {
          mode === 'SCHEDULE' && (
            <ReservationSchedule
              form={form}
              setForm={setForm}
              typeList={typeList}
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
