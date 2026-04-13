import styles from '../../styles/ReservationPage.module.css'
import type { ReservationConfirmProps } from '../../types/reservation'

const ReservationConfirm = ({ reservationId }: ReservationConfirmProps) => {
  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.step}>04</span>
        <h2 className={styles.sectionTitle}>예약 완료</h2>
      </div>

      <div className={styles.selectedSummary}>
        <span>예약이 정상적으로 접수되었습니다.</span>
        {reservationId && (
          <>
            <span className={styles.summaryDivider} />
            <span>{`예약 번호 ${reservationId}`}</span>
          </>
        )}
      </div>
    </div>
  )
}

export default ReservationConfirm
