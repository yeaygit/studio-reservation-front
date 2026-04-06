import { useDeferredValue, useEffect, useState } from 'react'
import { ArrowUpRight, FileQuestion, Plus, Search, Sparkles } from 'lucide-react'
import customAxios from '../../utils/customAxios'
import { CRUD_PAGE_MODES as FAQ_MODES } from '../../constants/pageModes'
import FaqDetail from '../../component/faq/FaqDetail'
import FaqForm from '../../component/faq/FaqForm'
import styles from '../../styles/FaqManagementPage.module.css'

const INITIAL_FORM = {
  question: '',
  answer: '',
  sortOrder: '',
}

const createSummary = (value) => {
  const normalizedValue = value.replace(/\s+/g, ' ')

  if (normalizedValue.length <= 50) {
    return normalizedValue
  }

  return `${normalizedValue.slice(0, 50)}...`
}

const normalizeFaq = (faq) => ({
  ...faq,
  summary: createSummary(faq?.answer),
})

const FaqManagementPage = () => {
  const [faqs, setFaqs] = useState([])
  const [selectedFaq, setSelectedFaq] = useState(null)
  const [mode, setMode] = useState(FAQ_MODES.LIST)
  const [form, setForm] = useState(INITIAL_FORM)
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const clearMessages = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const normalizedSearch = deferredSearchQuery.trim().toLowerCase()
  const filteredFaqs = normalizedSearch
    ? faqs.filter((faq) =>
        `${faq.question} ${faq.answer} ${faq.id ?? ''}`.toLowerCase().includes(normalizedSearch),
      )
    : faqs



  const getFaqs = async () => {
    try {
      const response = await customAxios.get('/admin/faq')
      const normalizedFaqs = response.data.map((res) => normalizeFaq(res))
      setFaqs(normalizedFaqs)
      return normalizedFaqs
    } catch (err) {
      setSuccessMessage('')
      setErrorMessage(err.response.data.errorMessage)
      return []
    }
  }

  const getFaqById = async (faqId) => {
    try {
      const response = await customAxios.get(`/admin/faq/${faqId}`)
      return response.data
    } catch (err) {
      setSuccessMessage('')
      setErrorMessage(err.response.data.errorMessage)
      return null
    }
  }

  const handleSearchChange = ({ target: { value } }) => {
    setSearchQuery(value)
  }

  const handleFormChange = ({ target: { name, value } }) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSelectFaq = async (faq) => {
    clearMessages()
    setMode(FAQ_MODES.DETAIL)

    const detailFaq = await getFaqById(faq.id)

    if (detailFaq) {
      setSelectedFaq(detailFaq)
    }
  }

  const handleOpenCreate = () => {
    clearMessages()
    setForm(INITIAL_FORM)
    setMode(FAQ_MODES.CREATE)
  }

  const handleOpenEdit = () => {
    if (!selectedFaq) {
      return
    }

    clearMessages()
    setForm({
      question: selectedFaq.question,
      answer: selectedFaq.answer,
      sortOrder: String(selectedFaq.sortOrder ?? ''),
    })
    setMode(FAQ_MODES.EDIT)
  }

  const handleCancelEditor = () => {
    clearMessages()
    setForm(INITIAL_FORM)
    setMode(selectedFaq ? FAQ_MODES.DETAIL : FAQ_MODES.LIST)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    clearMessages()

    const question = form.question.trim()
    const answer = form.answer.trim()

    if (!question || !answer) {
      setErrorMessage('질문과 답변을 모두 입력해주세요.')
      return
    }

    const payload = { question, answer }

    if (mode === FAQ_MODES.EDIT) {
      const sortOrder = Number(form.sortOrder)

      if (!Number.isFinite(sortOrder)) {
        setErrorMessage('수정할 때는 노출 순서를 입력해주세요.')
        return
      }

      payload.sortOrder = sortOrder
    }

    try {
      const response =
        mode === FAQ_MODES.CREATE
          ? await customAxios.post('/admin/faq', payload)
          : await customAxios.patch(`/admin/faq/${selectedFaq.id}`, payload)

      const savedFaq = normalizeFaq(response.data)

      setSelectedFaq(savedFaq)
      setForm(INITIAL_FORM)
      setMode(FAQ_MODES.DETAIL)
      setSuccessMessage(mode === FAQ_MODES.CREATE ? '등록 완료됐습니다.' : '수정 완료됐습니다.')

      const nextFaqs = await getFaqs()
      const matchedFaq = nextFaqs.find((faq) => faq.id === savedFaq.id)

      if (matchedFaq) {
        setSelectedFaq((previous) => ({
          ...matchedFaq,
          ...previous,
        }))
      }
    } catch (error) {
      setSuccessMessage('')
      setErrorMessage(error.response.data.errorMessage)
    }
  }

  const handleDelete = async () => {
    if (!selectedFaq?.id) {
      return
    }

    try {
      clearMessages()
      await customAxios.delete(`/admin/faq/${selectedFaq.id}`)
      await getFaqs()

      setSelectedFaq(null)
      setMode(FAQ_MODES.LIST)
      setSuccessMessage('삭제 완료됐습니다.')
    } catch (error) {
      setSuccessMessage('')
      setErrorMessage(error.response.data.errorMessage)
    } 
  }

  
  useEffect(() => {
    getFaqs()
  }, [])

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.title}>FAQ 관리</h1>
          <p className={styles.description}>자주 묻는 질문을 관리할 수 있습니다.</p>
        </div>

        <div className={styles.heroMetrics}>
          <article className={styles.metricCard}>
            <span className={styles.metricLabel}>전체 FAQ</span>
            <strong className={styles.metricValue}>{faqs.length}건</strong>
          </article>
        </div>
      </div>

      {
        successMessage.trim() !== "" && (
          <div
            className={styles.feedbackSuccess}
            role="status"
          >
            {successMessage}
          </div>
        )
      }

      {
        errorMessage.trim() !== "" && (
          <div
            className={styles.feedbackError}
            role="status"
          >
            {errorMessage}
          </div>
        )
      }

      <div className={styles.workspace}>
        <section className={styles.listPanel}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>FAQ 목록</h2>
            <button className={styles.primaryButton} type="button" onClick={handleOpenCreate}>
              <Plus size={16} />
              FAQ 추가
            </button>
          </div>

          <div className={styles.searchField}>
            <Search size={16} />
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="질문, 답변, ID로 검색"
              aria-label="FAQ 검색"
            />
          </div>

          <div className={styles.listMeta}>
            <span>{faqs.length}개 전체 항목</span>
          </div>

          <div className={styles.listBody}>
            {
              filteredFaqs.length === 0 ? (
                <div className={styles.listEmpty}>
                  <Sparkles size={18} />
                  {normalizedSearch
                    ? '검색 결과가 없습니다. 다른 키워드로 찾아보세요.'
                    : '등록된 FAQ가 없습니다. 첫 FAQ를 추가해보세요.'}
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isActive =
                    mode !== FAQ_MODES.CREATE &&
                    mode !== FAQ_MODES.EDIT &&
                    selectedFaq?.id === faq.id

                  return (
                    <button
                      key={faq.id ?? faq.question}
                      className={`${styles.listCard} ${isActive ? styles.listCardActive : ''}`}
                      type="button"
                      onClick={() => handleSelectFaq(faq)}
                    >
                      <div className={styles.listCardTop}>
                        <span className={styles.orderBadge}>
                          {faq.sortOrder !== null ? `순서 ${faq.sortOrder}` : '순서 미정'}
                        </span>
                        <ArrowUpRight size={14} />
                      </div>

                      <strong className={styles.listCardTitle}>{faq.question}</strong>
                      <p className={styles.listCardText}>
                        {faq.summary || '등록된 답변이 없습니다.'}
                      </p>

                      <div className={styles.listCardMeta}>
                        <span></span>
                        <span>{faq.createdAt}</span>
                      </div>
                    </button>
                  )
                }
              )
            )}
          </div>
        </section>

        <section className={styles.detailPanel}>
          {mode === FAQ_MODES.CREATE || mode === FAQ_MODES.EDIT ? (
            <FaqForm
              mode={mode}
              form={form}
              onChange={handleFormChange}
              onCancel={handleCancelEditor}
              onSubmit={handleSubmit}
            />
          ) : mode === FAQ_MODES.DETAIL && selectedFaq ? (
            <FaqDetail 
              faq={selectedFaq} 
              onEdit={handleOpenEdit} 
              onDelete={handleDelete} 
            />
          ) : (
            <div className={styles.detailEmpty}>
              <FileQuestion size={18} />
              왼쪽 목록에서 FAQ를 선택하거나 새 FAQ를 추가해보세요.
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default FaqManagementPage
