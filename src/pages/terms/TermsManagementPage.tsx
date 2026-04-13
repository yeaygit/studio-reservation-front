import { useDeferredValue, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowUpRight, FileText, Plus, Search, Sparkles } from 'lucide-react'
import { CRUD_PAGE_MODES as TERMS_MODES, type CrudPageMode } from '../../constants/pageModes'
import TermsDetail from '../../component/terms/TermsDetail'
import TermsForm from '../../component/terms/TermsForm'
import styles from '../../styles/FaqManagementPage.module.css'
import customAxios from '../../utils/customAxios'
import type { TermsFormState, TermsItem } from '../../types/content'
import { getApiErrorMessage } from '../../utils/apiError'

const INITIAL_FORM: TermsFormState = {
  title: '',
  content: '',
  isRequired: true,
}

const createSummary = (value = ''): string => {
  const normalizedValue = value.replace(/\s+/g, ' ').trim()

  if (!normalizedValue) {
    return ''
  }

  if (normalizedValue.length <= 70) {
    return normalizedValue
  }

  return `${normalizedValue.slice(0, 70)}...`
}

const normalizeTerms = (terms: TermsItem): TermsItem => ({
  ...terms,
  summary: createSummary(terms?.content),
})

const TermsManagementPage = () => {
  const [termsList, setTermsList] = useState<TermsItem[]>([])
  const [selectedTerms, setSelectedTerms] = useState<TermsItem | null>(null)
  const [mode, setMode] = useState<CrudPageMode>(TERMS_MODES.LIST)
  const [form, setForm] = useState<TermsFormState>(INITIAL_FORM)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  const clearMessages = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const normalizedSearch = deferredSearchQuery.trim().toLowerCase()
  const filteredTerms = normalizedSearch
    ? termsList.filter((terms) =>
        `${terms.title} ${terms.content ?? ''} ${terms.id ?? ''}`
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : termsList

  const requiredTermsCount = termsList.filter((terms) => terms.isRequired).length

  const getTerms = async (): Promise<TermsItem[]> => {
    try {
      const response = await customAxios.get<TermsItem[]>('/admin/terms')
      const normalizedTerms = response.data.map((terms) => normalizeTerms(terms))

      setTermsList(normalizedTerms)
      return normalizedTerms
    } catch (error: unknown) {
      setSuccessMessage('')
      setErrorMessage(getApiErrorMessage(error, '약관 목록을 불러오지 못했습니다.'))
      return []
    }
  }

  const getTermsById = async (termsId: number): Promise<TermsItem | null> => {
    try {
      const response = await customAxios.get<TermsItem>(`/admin/terms/${termsId}`)
      return response.data
    } catch (error: unknown) {
      setSuccessMessage('')
      setErrorMessage(getApiErrorMessage(error, '약관 상세 정보를 불러오지 못했습니다.'))
      return null
    }
  }

  const handleSearchChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(value)
  }

  const handleFormChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (name === 'isRequired') {
      setForm((previous) => ({
        ...previous,
        isRequired: value === 'true',
      }))
      return
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSelectTerms = async (terms: TermsItem) => {
    clearMessages()
    setMode(TERMS_MODES.DETAIL)

    if (!terms.id) {
      setErrorMessage('약관 ID가 없어 상세 정보를 불러올 수 없습니다.')
      return
    }

    const detailTerms = await getTermsById(terms.id)

    if (detailTerms) {
      setSelectedTerms(detailTerms)
    }
  }

  const handleOpenCreate = () => {
    clearMessages()
    setForm(INITIAL_FORM)
    setMode(TERMS_MODES.CREATE)
  }

  const handleOpenEdit = () => {
    if (!selectedTerms) {
      return
    }

    clearMessages()
    setForm({
      title: selectedTerms.title ?? '',
      content: selectedTerms.content ?? '',
      isRequired: selectedTerms.isRequired ?? true,
    })
    setMode(TERMS_MODES.EDIT)
  }

  const handleCancelEditor = () => {
    clearMessages()
    setForm(INITIAL_FORM)
    setMode(selectedTerms ? TERMS_MODES.DETAIL : TERMS_MODES.LIST)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearMessages()

    const title = form.title.trim()
    const content = form.content.trim()

    if (!title) {
      setErrorMessage('약관 제목을 입력해 주세요.')
      return
    }

    if (!content) {
      setErrorMessage('약관 내용을 입력해 주세요.')
      return
    }

    const payload = {
      title,
      content,
      isRequired: form.isRequired,
    }

    try {
      const response =
        mode === TERMS_MODES.CREATE
          ? await customAxios.post<TermsItem>('/admin/terms', payload)
          : await customAxios.patch<TermsItem>(`/admin/terms/${selectedTerms.id}`, payload)

      const savedTerms = normalizeTerms(response.data)
      const nextTerms = await getTerms()
      const matchedTerms = nextTerms.find((terms) => terms.id === savedTerms.id)

      setSelectedTerms(matchedTerms ?? savedTerms)
      setForm(INITIAL_FORM)
      setMode(TERMS_MODES.DETAIL)
      setSuccessMessage(
        mode === TERMS_MODES.CREATE
          ? '약관이 등록되었습니다.'
          : '약관이 수정되었습니다.',
      )
    } catch (error: unknown) {
      setSuccessMessage('')
      setErrorMessage(getApiErrorMessage(error, '약관 저장에 실패했습니다.'))
    }
  }

  const handleDelete = async () => {
    if (!selectedTerms?.id) {
      return
    }

    try {
      clearMessages()
      await customAxios.delete(`/admin/terms/${selectedTerms.id}`)
      await getTerms()

      setSelectedTerms(null)
      setMode(TERMS_MODES.LIST)
      setSuccessMessage('약관이 삭제되었습니다.')
    } catch (error: unknown) {
      setSuccessMessage('')
      setErrorMessage(getApiErrorMessage(error, '약관 삭제에 실패했습니다.'))
    }
  }

  useEffect(() => {
    void getTerms()
  }, [])

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.title}>약관 관리</h1>
          <p className={styles.description}>
            예약 과정에서 사용하는 약관과 동의 문구를 등록하고 수정할 수 있습니다.
          </p>
        </div>

        <div className={styles.heroMetrics}>
          <article className={styles.metricCard}>
            <span className={styles.metricLabel}>전체 약관</span>
            <strong className={styles.metricValue}>{termsList.length}건</strong>
          </article>
        </div>
      </div>

      {successMessage.trim() !== '' && (
        <div className={styles.feedbackSuccess} role="status">
          {successMessage}
        </div>
      )}

      {errorMessage.trim() !== '' && (
        <div className={styles.feedbackError} role="status">
          {errorMessage}
        </div>
      )}

      <div className={styles.workspace}>
        <section className={styles.listPanel}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>약관 목록</h2>
            <button className={styles.primaryButton} type="button" onClick={handleOpenCreate}>
              <Plus size={16} />
              약관 추가
            </button>
          </div>

          <div className={styles.searchField}>
            <Search size={16} />
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="제목, 내용, ID로 검색"
              aria-label="약관 검색"
            />
          </div>

          <div className={styles.listMeta}>
            <span>{filteredTerms.length}개의 결과</span>
          </div>

          <div className={styles.listBody}>
            {filteredTerms.length === 0 ? (
              <div className={styles.listEmpty}>
                <Sparkles size={18} />
                {normalizedSearch
                  ? '검색 결과가 없습니다. 다른 키워드로 다시 확인해 주세요.'
                  : '등록된 약관이 없습니다. 첫 약관을 추가해 보세요.'}
              </div>
            ) : (
              filteredTerms.map((terms) => {
                const isActive =
                  mode !== TERMS_MODES.CREATE &&
                  mode !== TERMS_MODES.EDIT &&
                  selectedTerms?.id === terms.id

                return (
                  <button
                    key={terms.id ?? terms.title}
                    className={`${styles.listCard} ${isActive ? styles.listCardActive : ''}`}
                    type="button"
                    onClick={() => handleSelectTerms(terms)}
                  >
                    <div className={styles.listCardTop}>
                      <span className={styles.orderBadge}>
                        {terms.isRequired ? '필수' : '선택'}
                      </span>
                      <ArrowUpRight size={14} />
                    </div>

                    <strong className={styles.listCardTitle}>{terms.title}</strong>
                    <p className={styles.listCardText}>
                      {terms.summary || '등록된 약관 내용이 없습니다.'}
                    </p>

                    <div className={styles.listCardMeta}>
                      <span></span>
                      <span>{terms.createdAt}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>

        <section className={styles.detailPanel}>
          {mode === TERMS_MODES.CREATE || mode === TERMS_MODES.EDIT ? (
            <TermsForm
              mode={mode}
              form={form}
              onChange={handleFormChange}
              onCancel={handleCancelEditor}
              onSubmit={handleSubmit}
            />
          ) : mode === TERMS_MODES.DETAIL && selectedTerms ? (
            <TermsDetail
              terms={selectedTerms}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ) : (
            <div className={styles.detailEmpty}>
              <FileText size={18} />
              왼쪽 목록에서 약관을 선택하거나 새 약관을 추가해 주세요.
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default TermsManagementPage
