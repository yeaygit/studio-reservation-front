import { useDeferredValue, useEffect, useState, type ChangeEvent } from 'react'
import { CalendarDays, Clock3, MessageSquare, Phone, Search, Sparkles, Users } from 'lucide-react'
import DatePicker from '../../component/common/DatePicker.tsx'
import styles from '../../styles/ReservationHistoryList.module.css'
import type { ReservationAdminItem, ReservationStatusCode } from '../../types/reservation'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatPhoneNumber } from '../../utils/formatSetting.ts'
import customAxios from '../../utils/customAxios'

type StatusTone = 'neutral' | 'warning' | 'success' | 'danger' | 'info'

const STATUS_META: Record<ReservationStatusCode, { label: string; tone: StatusTone }> = {
  PENDING: { label: '대기', tone: 'warning' },
  CONFIRMED: { label: '확정', tone: 'info' },
  CANCELLED: { label: '취소', tone: 'danger' },
}

const getCurrentDate = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const DEFAULT_DATE = getCurrentDate()

const getReservationSortValue = ({ date, startTime, createdAt }: ReservationAdminItem): number => {
  const normalizedTime = startTime.length === 5 ? `${startTime}:00` : startTime
  const scheduleDate = new Date(`${date}T${normalizedTime}`)

  if (!Number.isNaN(scheduleDate.getTime())) {
    return scheduleDate.getTime()
  }

  if (createdAt) {
    const createdDate = new Date(createdAt.replace(' ', 'T'))

    if (!Number.isNaN(createdDate.getTime())) {
      return createdDate.getTime()
    }
  }

  return 0
}

const sortReservations = (items: ReservationAdminItem[]): ReservationAdminItem[] =>
  [...items].sort((left, right) => getReservationSortValue(right) - getReservationSortValue(left))

const formatDisplayDate = (value: string): string => {
  const parsed = new Date(`${value}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(parsed)
}

const getStatusMeta = (value: ReservationStatusCode): { label: string; tone: StatusTone } => STATUS_META[value]

const getStatusClassName = (tone: StatusTone): string => {
  if (tone === 'warning') return styles.statusWarning
  if (tone === 'success') return styles.statusSuccess
  if (tone === 'danger') return styles.statusDanger
  if (tone === 'info') return styles.statusInfo
  return styles.statusNeutral
}

const ReservationHistoryList = () => {
  const [reservations, setReservations] = useState<ReservationAdminItem[]>([])
  const [date, setDate] = useState<string>(DEFAULT_DATE)
  const [nameFilter, setNameFilter] = useState<string>('')
  const deferredNameFilter = useDeferredValue(nameFilter)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const normalizedNameFilter = deferredNameFilter.trim()

  const fetchReservations = async (nextDate: string, nextNameFilter: string) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await customAxios.get<ReservationAdminItem[]>('/admin/reservations', {
        params: {
          date: nextDate,
          name: nextNameFilter || undefined,
        },
      })

      setReservations(sortReservations(response.data))
    } catch (error: unknown) {
      setReservations([])
      setErrorMessage(getApiErrorMessage(error, '예약 내역을 불러오지 못했습니다.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setDate(value || DEFAULT_DATE)
  }

  const handleNameFilterChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setNameFilter(value)
  }

  useEffect(() => {
    void fetchReservations(date, normalizedNameFilter)
  }, [date, normalizedNameFilter])

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.title}>예약 내역 관리</h1>
          <p className={styles.description}>예약 목록과 상태, 고객 요청 사항을 한 화면에서 확인할 수 있습니다.</p>
        </div>

        <div className={styles.filterGrid}>
          <DatePicker
            label="조회 날짜"
            name="reservationDate"
            value={date}
            onChange={handleDateChange}
            required
            containerClassName={styles.fieldGroup}
            labelClassName={styles.fieldLabel}
            inputClassName={styles.fieldInput}
          />

          <label className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>예약자명</span>
            <div className={styles.searchField}>
              <Search size={16} />
              <input
                type="search"
                value={nameFilter}
                onChange={handleNameFilterChange}
                placeholder="예약자명을 입력하세요"
                aria-label="예약자명 필터"
              />
            </div>
          </label>
        </div>
      </div>

      {errorMessage.trim() !== '' && (
        <div className={styles.feedbackError} role="status">
          {errorMessage}
        </div>
      )}

      <section className={styles.listPanel}>
        <div className={styles.listHeader}>
          <div></div>
          <span className={styles.listCount}>
            {formatDisplayDate(date)} · {reservations.length}건
          </span>
        </div>

        <div className={styles.listBody}>
          {isLoading ? (
            <div className={styles.emptyState}>예약 내역을 불러오는 중입니다.</div>
          ) : reservations.length === 0 ? (
            <div className={styles.emptyState}>
              <Sparkles size={18} />
              조건에 맞는 예약 내역이 없습니다. 예약자명 또는 조회 날짜를 확인해 보세요.
            </div>
          ) : (
            reservations.map((reservation) => {
              const statusMeta = getStatusMeta(reservation.status)
              const requestMessage = reservation.requestMessage?.trim()

              return (
                <article key={reservation.reservationId} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleGroup}>
                      <div className={styles.cardTitleRow}>
                        <strong className={styles.cardTitle}>{reservation.shootingTypeLabel}</strong>
                      </div>
                    </div>

                    <span className={`${styles.statusBadge} ${getStatusClassName(statusMeta.tone)}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className={styles.scheduleRow}>
                    <div className={styles.schedulePrimary}>
                      <CalendarDays size={18} />
                      <strong>{formatDisplayDate(reservation.date)}</strong>
                    </div>

                    <div className={styles.scheduleSecondary}>
                      <Clock3 size={16} />
                      <span>{`${reservation.startTime} - ${reservation.endTime}`}</span>
                    </div>
                  </div>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>예약자</span>
                      <strong className={styles.metaValue}>{reservation.name}</strong>
                    </div>

                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>연락처</span>
                      <span className={styles.metaInline}>
                        <Phone size={14} />
                        {formatPhoneNumber(reservation.phone)}
                      </span>
                    </div>

                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>인원</span>
                      <span className={styles.metaInline}>
                        <Users size={14} />
                        {reservation.headCount}명
                      </span>
                    </div>

                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>방문 경로</span>
                      <strong className={styles.metaValue}>{reservation.visitPath?.trim() || '-'}</strong>
                    </div>
                  </div>

                  <div className={styles.messageCard}>
                    <div className={styles.messageHeader}>
                      <span className={styles.metaLabel}>요청 사항</span>
                      <MessageSquare size={15} />
                    </div>
                    <p className={styles.messageText}>{requestMessage || '남겨진 요청 사항이 없습니다.'}</p>
                  </div>

                  <div className={styles.cardFooter}>
                    <span>신청일 {reservation.createdAt || '-'}</span>
                    <span>{reservation.date}</span>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </section>
    </section>
  )
}

export default ReservationHistoryList
