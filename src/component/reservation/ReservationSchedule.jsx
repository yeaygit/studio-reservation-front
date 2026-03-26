import React, { useEffect, useState } from 'react'
import styles from '../../styles/ReservationPage.module.css'
import Calendar from '../common/Calendar'

const timeToMin = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

const minToTime = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

const DEFAULT_BOOKED_SLOT_MINUTES = 30

const getBookedRange = (reservation) => {
  if (!reservation) return null

  if (typeof reservation === 'string') {
    const start = timeToMin(reservation)
    return { start, end: start + DEFAULT_BOOKED_SLOT_MINUTES }
  }

  const startLabel = reservation.startTime ?? reservation.time
  if (!startLabel) return null

  const start = timeToMin(startLabel)
  const duration = Number(reservation.duration)

  if (reservation.endTime) {
    return { start, end: timeToMin(reservation.endTime) }
  }

  if (Number.isFinite(duration) && duration > 0) {
    return { start, end: start + duration }
  }

  return { start, end: start + DEFAULT_BOOKED_SLOT_MINUTES }
}

const hasOverlap = (start, end, bookedList) =>
  bookedList.some((reservation) => {
    const bookedRange = getBookedRange(reservation)
    if (!bookedRange) return false

    return start < bookedRange.end && end > bookedRange.start
  })


const ReservationSchedule = ({form, setForm, typeList}) => {

  const [blockedDateList, setBlockedDateList] = useState(['2026-03-05', '2026-03-12', '2026-03-19', '2026-03-26']);
  const [holidayDateList, setHolidayDateList] = useState(['2026-05-01'])
  const [reservationSetting, setReservationSetting] = useState(
    {
      open: 10*60,
      close: 18*60,
      lunchStart: 12*60,
      lunchEnd: 13*60
    }
  )
  const [bookedList, setBookedList] = useState([
    { startTime: '10:00', endTime: '11:00' },
    { startTime: '14:00', endTime: '14:30' },
  ]);

  const [slots, setSlots] = useState([]);
  const selectedType = typeList.find(t => t.code === form.type)
  const duration = selectedType?.duration ?? 30

  const changeTimeSelect = (time) => {
    const totalMin = duration * form.headcount
    const startMin = timeToMin(time)

    if (!canReserve(startMin, totalMin, reservationSetting, bookedList)) {
      return
    }

    const endTime  = minToTime(timeToMin(time) + totalMin)
    setForm(prev => ({ ...prev, startTime: time, endTime }))
  }

  const changeDateSelect = (dateStr) => {
    setForm(prev => ({ ...prev, date: dateStr, startTime: '', endTime: '' }))
  }

  const isSelectedRange = (time) => {
    if (!form.startTime || !form.endTime) return false

    const t = timeToMin(time)
    const start = timeToMin(form.startTime)
    const end = timeToMin(form.endTime)

    return t >= start && t < end
  }

  const canReserve = (start, total, setting, bookedList) => {
    const end = start + total

    // 운영시간
    if (end > setting.close) return false

    // 점심시간
    if (start < setting.lunchEnd && end > setting.lunchStart) return false

    // 기존 예약 겹침
    return !hasOverlap(start, end, bookedList)
  }

  // 시간 목록 출력
  const generateSlots = (headcount, duration, bookedList) => {
    const total = duration * headcount
    const slots = []
    let current = reservationSetting.open

    while (current <= reservationSetting.close - total) {
      const reservable = canReserve(current, total, reservationSetting, bookedList)

      slots.push({
        time: minToTime(current),
        disabled: !reservable,
      })

      current += 30
    }

    return slots
  }

  useEffect(() => {
    if (!form.date) {
      setSlots([])
      return
    }

    // TODO: fetch(`/api/reservations?date=${form.date}`) 이후 setBookedList(response)
  }, [form.date])

  useEffect(() => {
    if (!form.date) {
      setSlots([])
      return
    }

    setSlots(generateSlots(form.headcount, duration, bookedList))
  }, [form.date, form.headcount, duration, bookedList, reservationSetting])

  // 인원 바뀌면 시간 초기화
  useEffect(() => {
    if (!form.date || !form.startTime) return

    const totalMin = duration * form.headcount
    const startMin = timeToMin(form.startTime)

    if (!canReserve(startMin, totalMin, reservationSetting, bookedList)) {
      setForm(prev => ({ ...prev, startTime: '', endTime: '' }))
    }
  }, [form.date, form.startTime, form.headcount, duration, bookedList, reservationSetting, setForm])

  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.step}>02</span>
        <h2 className={styles.sectionTitle}>날짜 및 시간을 선택해주세요</h2>
      </div>
      <div className={styles.scheduleLayout}>
        <div className={styles.scheduleLeft}>
          <Calendar 
            date={form.date} 
            setDate={changeDateSelect} 
            blockedDateList={blockedDateList} 
            holidayDateList={holidayDateList}
          />
        </div>
        <div className={styles.scheduleRight}>

          <div className={styles.headcountRow}>
            <span className={styles.inputLabel}>인원</span>
            <div className={styles.counter}>
              <button
                className={styles.counterBtn}
                onClick={() =>
                  setForm(prev => ({
                    ...prev,
                    headcount: Math.max(1, prev.headcount - 1),
                    startTime: '',
                    endTime: '',
                  }))
                }
              >
                -
              </button>
              <span className={styles.counterVal}>{form.headcount}</span>
              <button
                className={styles.counterBtn}
                onClick={() =>
                  setForm(prev => ({
                    ...prev,
                    headcount: prev.headcount + 1,
                    startTime: '',
                    endTime: '',
                  }))
                }
              >
                +
              </button>
            </div>
          </div>

          {form.date && (
            <p className={styles.durationNote}>
              총 소요시간
              <strong> {duration * form.headcount}분</strong>
              {form.headcount > 1 && ` (${duration}분 × ${form.headcount}명)`}
            </p>
          )}

          {form.date ? (
            <div className={styles.slotSection}>
              <p className={styles.slotLabel}>시간 선택</p>
              <div className={styles.slotGrid}>
                {slots.map(({ time, disabled }) => (
                  <button
                    key={time}
                    className={[
                      styles.slotBtn,
                      disabled ? styles.slotDisabled : '',
                      isSelectedRange(time) ? styles.slotSelected : '',
                    ].join(' ')}
                    onClick={() => !disabled && changeTimeSelect(time)}
                    disabled={disabled}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className={styles.slotPlaceholder}>날짜를 먼저 선택해주세요</p>
          )}

          {form.startTime && (
            <div className={styles.selectedSummary}>
              <span>{form.date}</span>
              <span className={styles.summaryDivider} />
              <span>{form.startTime} ~ {form.endTime}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReservationSchedule
