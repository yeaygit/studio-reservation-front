import React, { useEffect, useState } from 'react'
import customAxios from '../../utils/customAxios'
import { minToTime, timeToMin } from '../../utils/timeUtils'
import styles from '../../styles/ReservationPage.module.css'
import Calendar from '../common/Calendar'

// 오늘부터 예약 오픈 일수만큼의 선택 가능 날짜 범위를 만든다.
const getReservationWindow = (reservationOpenDays) => {
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + reservationOpenDays - 1)

  return {
    startDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    endDate: `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
  }
}

// 예약 목록 데이터에서 시작/종료 시간을 공통 형태로 맞춘다.
const getBookedRange = (reservation) => {
  if (!reservation || typeof reservation === 'string') {
    return null
  }

  const start = timeToMin(reservation.startTime ?? reservation.time)

  if (reservation.endTime) {
    const end = timeToMin(reservation.endTime)
    return Number.isFinite(start) && Number.isFinite(end) ? { start, end } : null
  }

  const duration = Number(reservation.duration)
  return Number.isFinite(start) && Number.isFinite(duration) && duration > 0
    ? { start, end: start + duration }
    : null
}

const hasOverlap = (start, end, bookedList) =>
  bookedList.some((reservation) => {
    const bookedRange = getBookedRange(reservation)
    return bookedRange ? start < bookedRange.end && end > bookedRange.start : false
  })

// 운영 종료 시간, 점심시간, 기존 예약 겹침 여부를 기준으로 예약 가능 여부를 판단한다.
const canReserve = (start, totalMinutes, setting, bookedList) => {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return false
  }

  const end = start + totalMinutes
  const hasLunchWindow = setting.lunchEnd > setting.lunchStart

  if (end > setting.closeTime) {
    return false
  }

  if (hasLunchWindow && start < setting.lunchEnd && end > setting.lunchStart) {
    return false
  }

  return !hasOverlap(start, end, bookedList)
}

// 점심시간과 겹치는 시작 슬롯은 목록에서 숨기고, 나머지는 disabled 여부만 계산한다.
const generateSlots = (setting, totalMinutes, bookedList) => {
  if (
    !setting ||
    !Number.isFinite(setting.openTime) ||
    !Number.isFinite(setting.closeTime) ||
    !Number.isFinite(setting.slotUnit) ||
    !Number.isFinite(totalMinutes) ||
    totalMinutes <= 0
  ) {
    return []
  }

  const slots = []
  const lastStart = setting.closeTime - setting.slotUnit

  for (let current = setting.openTime; current <= lastStart; current += setting.slotUnit) {
    const end = current + totalMinutes

    if (current < setting.lunchEnd && end > setting.lunchStart) {
      continue
    }

    slots.push({
      time: minToTime(current),
      disabled: !canReserve(current, totalMinutes, setting, bookedList),
    })
  }

  return slots
}

const ReservationSchedule = ({ form, setForm, typeList }) => {
  const [reservationSetting, setReservationSetting] = useState(null)
  const [bookedListByDate, setBookedListByDate] = useState([])

  const [slots, setSlots] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  const selectedType = typeList.find((type) => type.code === form.type)
  const duration = Number(selectedType?.duration ?? 0)
  const totalMinutes = duration * form.headcount
  const reservationWindow = reservationSetting
    ? getReservationWindow(reservationSetting.reservationOpenDays)
    : null

  // 예약 설정은 백엔드 응답을 그대로 사용한다.
  const loadReservationSetting = async () => {
    setErrorMessage('')

    try {
      const response = await customAxios.get('/v1/reservations/setting')
      setReservationSetting(response.data)
    } catch {
      setReservationSetting(null)
      setErrorMessage('예약 설정 정보를 불러오지 못했습니다.')
    }
  }

  const changeDateSelect = (dateString) => {
    setForm((previous) => ({
      ...previous,
      date: dateString,
      // 날짜가 바뀌면 기존 시간 선택은 무효이므로 함께 초기화한다.
      startTime: '',
      endTime: '',
    }))
  }

  // 사용자가 시작 시간을 선택하면 현재 인원 기준 종료 시간까지 함께 확정한다.
  const changeTimeSelect = (time) => {
    if (!reservationSetting) {
      return
    }

    const startMinutes = timeToMin(time)

    if (!canReserve(startMinutes, totalMinutes, reservationSetting, bookedListByDate)) {
      return
    }

    setForm((previous) => ({
      ...previous,
      startTime: time,
      endTime: minToTime(startMinutes + totalMinutes),
    }))
  }

  const isSelectedRange = (time) => {
    if (!form.startTime || !form.endTime) {
      return false
    }

    const target = timeToMin(time)
    const start = timeToMin(form.startTime)
    const end = timeToMin(form.endTime)

    return target >= start && target < end
  }

  const loadBookedListByDate = async () => {

    try {
      const response = await customAxios.get('/v1/reservations/booked-times', {
        params: {
          date: form.date,
        },
      })

      setBookedListByDate(response.data)
      setErrorMessage('')
    } catch {
      if (!isActive) {
        return
      }

      setBookedListByDate([])
      setErrorMessage('선택한 날짜의 예약 현황을 불러오지 못했습니다.')
    }
  }

  useEffect(() => {
    void loadReservationSetting()
  }, [])

  useEffect(() => {
    if (!form.date) {
      setBookedListByDate([])
      setSlots([])
      return
    }

    void loadBookedListByDate()
  }, [form.date])

  // 날짜나 인원 수가 바뀌면 현재 조건에 맞는 슬롯 목록을 다시 계산한다.
  useEffect(() => {
    if (!form.date || !reservationSetting) {
      setSlots([])
      return
    }

    setSlots(generateSlots(reservationSetting, totalMinutes, bookedListByDate))
  }, [bookedListByDate, form.date, reservationSetting, totalMinutes])

  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.step}>02</span>
        <h2 className={styles.sectionTitle}>날짜와 시간을 선택해 주세요</h2>
      </div>

      {errorMessage.trim() !== '' && (
        <div className={styles.stepMessage} role="status">
          {errorMessage}
        </div>
      )}

      <div className={styles.scheduleLayout}>
        <div className={styles.scheduleLeft}>
          {reservationSetting ? (
            <Calendar
              date={form.date}
              setDate={changeDateSelect}
              blockedDateList={reservationSetting.blockedDays}
              holidayDateList={reservationSetting.closedDays}
              minDate={reservationWindow?.startDate}
              maxDate={reservationWindow?.endDate}
            />
          ) : (
            <p className={styles.slotPlaceholder}>예약 설정 정보가 없어 일정을 표시할 수 없습니다.</p>
          )}
        </div>

        <div className={styles.scheduleRight}>
          <div className={styles.headcountRow}>
            <span className={styles.inputLabel}>인원</span>
            <div className={styles.counter}>
              <button
                className={styles.counterBtn}
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    headcount: Math.max(1, previous.headcount - 1),
                    startTime: '',
                    endTime: '',
                  }))
                }
                type="button"
              >
                -
              </button>
              <span className={styles.counterVal}>{form.headcount}</span>
              <button
                className={styles.counterBtn}
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    headcount: previous.headcount + 1,
                    startTime: '',
                    endTime: '',
                  }))
                }
                type="button"
              >
                +
              </button>
            </div>
          </div>

          {form.date && reservationSetting && duration > 0 && (
            <p className={styles.durationNote}>
              총 소요 시간
              <strong>{` ${totalMinutes}분`}</strong>
              {form.headcount > 1 && ` (${duration}분 x ${form.headcount}명)`}
            </p>
          )}

          {form.date && reservationSetting ? (
            <div className={styles.slotSection}>
              <p className={styles.slotLabel}>시간 선택</p>
              <div className={styles.slotGrid}>
                {slots.length > 0 ? (
                  slots.map(({ time, disabled }) => {
                    const isSelected = isSelectedRange(time)

                    return (
                      <button
                        key={time}
                        className={[
                          styles.slotBtn,
                          isSelected && disabled ? styles.slotSelectedDisabled : '',
                          isSelected && !disabled ? styles.slotSelected : '',
                          !isSelected && disabled ? styles.slotDisabled : '',
                        ].join(' ')}
                        onClick={() => !disabled && changeTimeSelect(time)}
                        disabled={disabled}
                        type="button"
                      >
                        {time}
                      </button>
                    )
                  })
                ) : (
                  <p className={styles.slotPlaceholder}>
                    {duration > 0 ? '예약 가능한 시간이 없습니다.' : '촬영 유형을 먼저 선택해 주세요.'}
                  </p>
                )}
              </div>
            </div>
          ) : !reservationSetting ? (
            <p className={styles.slotPlaceholder}>예약 설정 확인 후 다시 시도해 주세요.</p>
          ) : (
            <p className={styles.slotPlaceholder}>먼저 날짜를 선택해 주세요.</p>
          )}

          {form.startTime && (
            <div className={styles.selectedSummary}>
              <span>{form.date}</span>
              <span className={styles.summaryDivider} />
              <span>
                {form.startTime} ~ {form.endTime}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReservationSchedule
