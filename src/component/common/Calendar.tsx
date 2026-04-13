import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from '../../styles/Calendar.module.css'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

interface CalendarProps {
  date?: string
  setDate: (date: string) => void
  holidayDateList?: string[]
  blockedDateList?: string[]
  minDate?: string
  maxDate?: string
}

interface DateState {
  isPast: boolean
  isBlocked: boolean
  isHoliday: boolean
  isDisabled: boolean
}

// 년/월/일 숫자를 예약 API에서 쓰는 YYYY-MM-DD 형식으로 맞춘다.
const toDateStr = (year: number, month: number, day: number): string =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

// 문자열 날짜를 Date 객체로 안전하게 변환하고, 해석할 수 없으면 null을 돌려준다.
const parseDateString = (value ?: string | null): Date | null => {
  if (!value) {
    return null
  }

  const [year, month, day] = String(value).split('-').map(Number)

  if (![year, month, day].every(Number.isFinite)) {
    return null
  }

  return new Date(year, month - 1, day)
}

// 시/분/초 차이 때문에 날짜 비교가 흔들리지 않도록 자정 기준으로 정규화한다.
const toStartOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const Calendar = ({
  date,
  setDate,
  holidayDateList = [],
  blockedDateList = [],
  minDate,
  maxDate,
}: CalendarProps) => {
  const today = toStartOfDay(new Date())
  const initialViewDate = parseDateString(date) ?? parseDateString(minDate) ?? today
  const [viewYear, setViewYear] = useState<number>(initialViewDate.getFullYear())
  const [viewMonth, setViewMonth] = useState<number>(initialViewDate.getMonth())

  const minSelectableDate = parseDateString(minDate)
  const maxSelectableDate = parseDateString(maxDate)
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  useEffect(() => {
    const selectedDate = parseDateString(date)

    if (!selectedDate) {
      return
    }

    // 외부에서 선택 날짜가 바뀌면 현재 보고 있는 달도 함께 동기화한다.
    setViewYear(selectedDate.getFullYear())
    setViewMonth(selectedDate.getMonth())
  }, [date])

  const prevMonth = (): void => {
    if (viewMonth === 0) {
      setViewYear((year) => year - 1)
      setViewMonth(11)
      return
    }

    setViewMonth((month) => month - 1)
  }

  const nextMonth = (): void => {
    if (viewMonth === 11) {
      setViewYear((year) => year + 1)
      setViewMonth(0)
      return
    }

    setViewMonth((month) => month + 1)
  }

  // 날짜별 상태를 한곳에서 계산해 셀 렌더링과 선택 로직에서 공통으로 사용한다.
  const getDateState = (targetDate: Date, dateString: string): DateState => {
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

  const handleSelect = (day: number): void => {
    const dateString = toDateStr(viewYear, viewMonth, day)
    const dateState = getDateState(new Date(viewYear, viewMonth, day), dateString)

    if (dateState.isDisabled) {
      return
    }

    setDate(dateString)
  }

  // 시작 요일만큼 빈 칸을 채운 뒤 실제 날짜를 붙여 달력 그리드를 만든다.
  const cells: Array<number | null> = []

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
            return <span key={`empty-${index}`} aria-hidden="true" />
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
