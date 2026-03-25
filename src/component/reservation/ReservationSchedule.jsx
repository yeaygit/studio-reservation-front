import React, { useEffect, useState } from 'react'
import styles from '../../styles/ReservationPage.module.css'
import Calendar from '../common/Calendar'

const ReservationSchedule = ({form, setForm}) => {

  const [date, setDate] = useState(form.date)

  const blockedDateList = ['2026-03-05', '2026-03-12', '2026-03-19', '2026-03-26']
  const holidayDateList = ['2026-05-01']
  
  const changeFormData = (e) => {
    const { name, value } = e.data;

    setForm(prev => setForm(
      {
        ...prev,
        [name]: value
      }
    ))
  };

  useEffect(() => {
    if(date){
      setForm(prev => setForm({...prev, date: date}))
    }
  }, [date])

  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.step}>02</span>
        <h2 className={styles.sectionTitle}>날짜 및 시간을 선택해주세요</h2>
      </div>
      <div className={styles.sectionSchedule}>
        <Calendar date={date} setDate={setDate} blockedDateList={blockedDateList} holidayDateList={holidayDateList}/>
        <div className={styles.inputItem}>
          <span>인원</span>
          <input value={form.headCount} name='headCount' onChange={changeFormData}/>
        </div>
      </div>
    </div>
  )
}

export default ReservationSchedule
