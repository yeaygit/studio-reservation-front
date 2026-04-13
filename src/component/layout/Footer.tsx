import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore, { selectIsAuthenticated } from '../../store/useAuthStore'

const Footer = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAuthButtonClick = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setIsSubmitting(true)

    try {
      await logout()
      navigate('/login')
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.'
      window.alert(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="footer">
      <div className="footer-shell">
        <div className="footer-copy">
          <span className="footer-kicker">ROMI STUDIO</span>
          <strong className="footer-title">Studio Reservation</strong>
          <p className="footer-text">촬영 예약 및 스튜디오 이용 안내</p>
        </div>

        <div className="footer-actions">
          <button
            className={`footer-action-btn ${isAuthenticated ? 'footer-action-btn--logout' : ''}`}
            onClick={handleAuthButtonClick}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? '처리 중...' : isAuthenticated ? '로그아웃' : '관리자 로그인'}
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
