import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { logout } from '../../utils/auth'

const Footer = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [hasAccessToken, setHasAccessToken] = useState(() => Boolean(sessionStorage.getItem('Access')))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setHasAccessToken(Boolean(sessionStorage.getItem('Access')))
  }, [location.pathname])

  const handleAuthButtonClick = async () => {
    if (!hasAccessToken) {
      navigate('/login')
      return
    }

    setIsSubmitting(true)

    try {
      await logout()
      setHasAccessToken(false)
      navigate('/login')
    } catch (error) {
      window.alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='footer'>
      <button
        className='footer-admin-btn'
        onClick={handleAuthButtonClick}
        disabled={isSubmitting}
      >
        {hasAccessToken ? '로그아웃' : '관리자 로그인'}
      </button>
    </div>
  )
}

export default Footer
