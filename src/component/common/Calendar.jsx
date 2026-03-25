import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from '../../styles/Calendar.module.css'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

const toDateStr = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`


const Calendar = ({date, setDate, holidayDateList, blockedDateList}) => {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const handleSelect = (day) => {
    const dateStr = toDateStr(viewYear, viewMonth, day)
    const date = new Date(viewYear, viewMonth, day)
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const isBlocked = blockedDateList.includes(dateStr)
    const isHoliday = holidayDateList.includes(dateStr)
    if (isPast || isBlocked || isHoliday) return
    setDate(dateStr)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className={styles.calendarWrap}>
      {/* 헤더 */}
      <div className={styles.calHeader}>
        <button className={styles.navBtn} onClick={prevMonth}>
          <ChevronLeft size={16} />
        </button>
        <span className={styles.calTitle}>
          {viewYear}년
          <span className={styles.calMonth}>
            {String(viewMonth + 1).padStart(2, '0')} 월
          </span>
        </span>
        <button className={styles.navBtn} onClick={nextMonth}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className={styles.dayRow}>
        {DAYS.map((d, i) => (
          <span
            key={d}
            className={`${styles.dayLabel} ${i === 0 ? styles.sun : ''} ${i === 6 ? styles.sat : ''}`}
          >
            {d}
          </span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className={styles.dateGrid}>
        {cells.map((day, idx) => {
          if (!day) return <span key={`empty-${idx}`} />

          const dateStr = toDateStr(viewYear, viewMonth, day)
          const newDate = new Date(viewYear, viewMonth, day)
          const isPast = newDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const isBlocked = blockedDateList.includes(dateStr)
          const isHoliday = holidayDateList.includes(dateStr)
          const isSelected = date === dateStr
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear()
          const isSun = new Date(viewYear, viewMonth, day).getDay() === 0
          const isSat = new Date(viewYear, viewMonth, day).getDay() === 6

          return (
            <button
              key={day}
              className={[
                styles.dateCell,
                isPast || isBlocked || isHoliday ? styles.disabled : '',
                isSelected ? styles.selected : '',
                isToday && !isSelected ? styles.today : '',
                isSun && !isSelected && !isPast ? styles.sun : '',
                isSat && !isSelected && !isPast ? styles.sat : '',
                isHoliday && !isSelected ? styles.holiday : '',
              ].join(' ')}
              onClick={() => handleSelect(day)}
              disabled={isPast || isBlocked || isHoliday}
              >
              {day}
              {isHoliday && !isPast && <span className={styles.holidayDot} />}
              {isBlocked && !isPast && <span className={styles.blockedDot} />}
            </button>
          )
        })}
      </div>

      {/* 범례 */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: 'var(--ink-faint)' }} />
          예약 마감
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: 'var(--ink)' }} />
          선택됨
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#d85a5a' }} />
          휴일/휴무
        </span>
      </div>
    </div>
  )
}

export default Calendar
