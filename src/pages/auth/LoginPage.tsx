import { ChangeEvent, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../../styles/LoginPage.module.css'
import useAuthStore from '../../store/useAuthStore'
import { getApiErrorMessage } from '../../utils/apiError'

const LoginPage = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [form, setForm] = useState({
    username: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event : FormEvent<HTMLFormElement>) : Promise<void> => {
    event.preventDefault()

    if (!form.username.trim() || !form.password.trim()) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.')
      setSuccessMessage('')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await login({
        username: form.username.trim(),
        password: form.password,
      })

      setSuccessMessage('로그인에 성공했습니다.')
      navigate('/admin')
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, '로그인에 실패했습니다.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>로그인</h2>
            <p className={styles.formCopy}>아이디와 비밀번호를 입력해주세요.</p>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>아이디</span>
            <input
              className={styles.input}
              type="text"
              name="username"
              placeholder="아이디를 입력하세요"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              disabled={isSubmitting}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>비밀번호</span>
            <input
              className={styles.input}
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </label>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}

          <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default LoginPage
