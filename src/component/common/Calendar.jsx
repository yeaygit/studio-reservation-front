import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from '../../styles/Calendar.module.css'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

const toDateStr = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const parseDateString = (value) => {
  if (!value) {
    return null
  }

  const [year, month, day] = String(value).split('-').map(Number)

  if (![year, month, day].every(Number.isFinite)) {
    return null
  }

  return new Date(year, month - 1, day)
}

const toStartOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const Calendar = ({
  date,
  setDate,
  holidayDateList = [],
  blockedDateList = [],
  minDate,
  maxDate,
}) => {
  const today = toStartOfDay(new Date())
  const initialViewDate = parseDateString(date) ?? parseDateString(minDate) ?? today
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth())

  const minSelectableDate = parseDateString(minDate)
  const maxSelectableDate = parseDateString(maxDate)
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  useEffect(() => {
    const selectedDate = parseDateString(date)

    if (!selectedDate) {
      return
    }

    setViewYear(selectedDate.getFullYear())
    setViewMonth(selectedDate.getMonth())
  }, [date])

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((year) => year - 1)
      setViewMonth(11)
      return
    }

    setViewMonth((month) => month - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((year) => year + 1)
      setViewMonth(0)
      return
    }

    setViewMonth((month) => month + 1)
  }

  const getDateState = (targetDate, dateString) => {
    const normalizedDate = toStartOfDay(targetDate)
    const isPast = normalizedDate < today
    const isBeforeMin = minSelectableDate ? normalizedDate < minSelectableDate : false
    const isAfterMax = maxSelectableDate ? normalizedDate > maxSelectableDate : false
    const isBlocked = blockedDateList.includes(dateString)
    const isHoliday = holidayDateList.includes(dateString)

    return {
      isPast,
      isBlocked,
      isHoliday,
      isDisabled: isPast || isBeforeMin || isAfterMax || isBlocked || isHoliday,
    }
  }

  const handleSelect = (day) => {
    const dateString = toDateStr(viewYear, viewMonth, day)
    const dateState = getDateState(new Date(viewYear, viewMonth, day), dateString)

    if (dateState.isDisabled) {
      return
    }

    setDate(dateString)
  }

  const cells = []

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day)
  }

  return (
    <div className={styles.calendarWrap}>
      <div className={styles.calHeader}>
        <button className={styles.navBtn} onClick={prevMonth} type="button">
          <ChevronLeft size={16} />
        </button>
        <span className={styles.calTitle}>
          {`${viewYear}년`}
          <span className={styles.calMonth}>{`${String(viewMonth + 1).padStart(2, '0')}월`}</span>
        </span>
        <button className={styles.navBtn} onClick={nextMonth} type="button">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className={styles.dayRow}>
        {DAYS.map((dayLabel, index) => (
          <span
            key={dayLabel}
            className={`${styles.dayLabel} ${index === 0 ? styles.sun : ''} ${index === 6 ? styles.sat : ''}`}
          >
            {dayLabel}
          </span>
        ))}
      </div>

      <div className={styles.dateGrid}>
        {cells.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} />
          }

          const dateString = toDateStr(viewYear, viewMonth, day)
          const currentDate = new Date(viewYear, viewMonth, day)
          const { isPast, isBlocked, isHoliday, isDisabled } = getDateState(currentDate, dateString)
          
          const isSelected = date === dateString
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear()
          const dayOfWeek = currentDate.getDay()
          const isSun = dayOfWeek === 0
          const isSat = dayOfWeek === 6

          return (
            <button
              key={dateString}
              className={[
                styles.dateCell,
                isDisabled ? styles.disabled : '',
                isSelected ? styles.selected : '',
                isToday && !isSelected ? styles.today : '',
                isSun && !isSelected && !isDisabled ? styles.sun : '',
                isSat && !isSelected && !isDisabled ? styles.sat : '',
                isHoliday && !isSelected ? styles.holiday : '',
              ].join(' ')}
              onClick={() => handleSelect(day)}
              disabled={isDisabled}
              type="button"
            >
              {day}
              {isHoliday && !isPast && <span className={styles.holidayDot} />}
              {isBlocked && !isPast && <span className={styles.blockedDot} />}
            </button>
          )
        })}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotBlocked}`} />
          예약 마감
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotSelected}`} />
          선택됨
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotHoliday}`} />
          휴무일
        </span>
      </div>
    </div>
  )
}

export default Calendar
