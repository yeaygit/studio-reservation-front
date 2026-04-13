import { useDeferredValue, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowUpRight, BellRing, Plus, Search, Sparkles } from 'lucide-react'
import { CRUD_PAGE_MODES as NOTICE_MODES, type CrudPageMode } from '../../constants/pageModes'
import NoticeDetail from '../../component/notice/NoticeDetail'
import NoticeForm from '../../component/notice/NoticeForm'
import styles from '../../styles/FaqManagementPage.module.css'
import customAxios from '../../utils/customAxios'
import type { Notice, NoticeFormState } from '../../types/content'
import { getApiErrorMessage } from '../../utils/apiError'

const INITIAL_FORM: NoticeFormState = {
  title: '',
  content: '',
  isPopup: false,
  popupStartDate: '',
  popupEndDate: '',
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

const normalizeNotice = (notice: Notice): Notice => ({
  ...notice,
  summary: createSummary(notice?.content),
})


const NoticeManagementPage = () => {
  const [notices, setNotices] = useState<Notice[]>([])
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [mode, setMode] = useState<CrudPageMode>(NOTICE_MODES.LIST)
  const [form, setForm] = useState<NoticeFormState>(INITIAL_FORM)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  const clearMessages = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const normalizedSearch = deferredSearchQuery.trim().toLowerCase()
  const filteredNotices = normalizedSearch
    ? notices.filter((notice) =>
        `${notice.title} ${notice.content ?? ''} ${notice.id ?? ''}`
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : notices

  const getNotices = async (): Promise<Notice[]> => {
    try {
      const response = await customAxios.get<Notice[]>('/admin/notice')
      const normalizedNotices = response.data.map((notice) => normalizeNotice(notice))

      setNotices(normalizedNotices)
      return normalizedNotices
    } catch (error: unknown) {
      setSuccessMessage('')
      setErrorMessage(getApiErrorMessage(error, '공지사항 목록을 불러오지 못했습니다.'))
      return []
    }
  }

  const getNoticeById = async (noticeId: number): Promise<Notice | null> => {
    try {
      const response = await customAxios.get<Notice>(`/admin/notice/${noticeId}`)
      return response.data
    } catch (error: unknown) {
      setSuccessMessage('')
      setErrorMessage(getApiErrorMessage(error, '공지사항 상세 정보를 불러오지 못했습니다.'))
      return null
    }
  }

  const handleSearchChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(value)
  }

  const handleFormChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (name === 'isPopup') {
      const nextValue = value === 'true'

      setForm((previous) => ({
        ...previous,
        [name]: nextValue,
        ...(name === 'isPopup' && !nextValue
          ? {
              popupStartDate: '',
              popupEndDate: '',
            }
          : {}),
      }))
      return
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSelectNotice = async (notice: Notice) => {
    clearMessages()
    setMode(NOTICE_MODES.DETAIL)

    if (!notice.id) {
      setErrorMessage('공지사항 ID가 없어 상세 정보를 불러올 수 없습니다.')
      return
    }

    const detailNotice = await getNoticeById(notice.id)

    if (detailNotice) {
      setSelectedNotice(detailNotice)
    }
  }

  const handleOpenCreate = () => {
    clearMessages()
    setForm(INITIAL_FORM)
    setMode(NOTICE_MODES.CREATE)
  }

  const handleOpenEdit = () => {
    if (!selectedNotice) {
      return
    }

    clearMessages()
    setForm({
      title: selectedNotice.title ?? '',
      content: selectedNotice.content ?? '',
      isPopup: selectedNotice.isPopup ?? false,
      popupStartDate: selectedNotice.popupStartDate ?? '',
      popupEndDate: selectedNotice.popupEndDate ?? '',
    })
    setMode(NOTICE_MODES.EDIT)
  }

  const handleCancelEditor = () => {
    clearMessages()
    setForm(INITIAL_FORM)
    setMode(selectedNotice ? NOTICE_MODES.DETAIL : NOTICE_MODES.LIST)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearMessages()

    const title = form.title.trim()
    const content = form.content.trim()

    if (!title) {
      setErrorMessage('공지 제목을 입력해 주세요.')
      return
    }

    const payload: {
      title: string
      content: string
      isPopup: boolean
      popupStartDate: string | null
      popupEndDate: string | null
    } = {
      title,
      content,
      isPopup: form.isPopup,
      popupStartDate: null,
      popupEndDate: null,
    }

    if (form.isPopup) {
      if (!form.popupStartDate || !form.popupEndDate) {
        setErrorMessage('팝업 공지는 노출 시작일과 종료일을 모두 입력해 주세요.')
        return
      }

      if (form.popupEndDate < form.popupStartDate) {
        setErrorMessage('팝업 종료일은 시작일보다 빠를 수 없습니다.')
        return
      }

      payload.popupStartDate = form.popupStartDate
      payload.popupEndDate = form.popupEndDate
    }

    try {
      const response =
        mode === NOTICE_MODES.CREATE
          ? await customAxios.post<Notice>('/admin/notice', payload)
          : await customAxios.patch<Notice>(`/admin/notice/${selectedNotice.id}`, payload)

      const savedNotice = normalizeNotice(response.data)
      const nextNotices = await getNotices()
      const matchedNotice = nextNotices.find((notice) => notice.id === savedNotice.id)

      setSelectedNotice(matchedNotice ?? savedNotice)
      setForm(INITIAL_FORM)
      setMode(NOTICE_MODES.DETAIL)
      setSuccessMessage(mode === NOTICE_MODES.CREATE ? '공지사항을 등록했습니다.' : '공지사항을 수정했습니다.')
    } catch (error: unknown) {
      setSuccessMessage('')
      setErrorMessage(getApiErrorMessage(error, '공지사항 저장에 실패했습니다.'))
    }
  }

  const handleDelete = async () => {
    if (!selectedNotice?.id) {
      return
    }

    try {
      clearMessages()
      await customAxios.delete(`/admin/notice/${selectedNotice.id}`)
      await getNotices()

      setSelectedNotice(null)
      setMode(NOTICE_MODES.LIST)
      setSuccessMessage('공지사항을 삭제했습니다.')
    } catch (error: unknown) {
      setSuccessMessage('')
      setErrorMessage(getApiErrorMessage(error, '공지사항 삭제에 실패했습니다.'))
    }
  }

  useEffect(() => {
    void getNotices()
  }, [])

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.title}>공지사항 관리</h1>
          <p className={styles.description}>등록된 공지사항을 확인하고 새 공지를 작성하거나 수정할 수 있습니다.</p>
        </div>

        <div className={styles.heroMetrics}>
          <article className={styles.metricCard}>
            <span className={styles.metricLabel}>전체 공지</span>
            <strong className={styles.metricValue}>{notices.length}건</strong>
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
            <h2 className={styles.sectionTitle}>공지 목록</h2>
            <button className={styles.primaryButton} type="button" onClick={handleOpenCreate}>
              <Plus size={16} />
              공지 추가
            </button>
          </div>

          <div className={styles.searchField}>
            <Search size={16} />
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="제목, 내용, ID로 검색"
              aria-label="공지사항 검색"
            />
          </div>

          <div className={styles.listMeta}>
            <span>{notices.length}개의 항목</span>
          </div>

          <div className={styles.listBody}>
            {filteredNotices.length === 0 ? (
              <div className={styles.listEmpty}>
                <Sparkles size={18} />
                {normalizedSearch
                  ? '검색 결과가 없습니다. 다른 검색어로 다시 확인해 주세요.'
                  : '등록된 공지사항이 없습니다. 첫 공지를 추가해 보세요.'}
              </div>
            ) : (
              filteredNotices.map((notice) => {
                const isActive =
                  mode !== NOTICE_MODES.CREATE &&
                  mode !== NOTICE_MODES.EDIT &&
                  selectedNotice?.id === notice.id

                return (
                  <button
                    key={notice.id ?? notice.title}
                    className={`${styles.listCard} ${isActive ? styles.listCardActive : ''}`}
                    type="button"
                    onClick={() => handleSelectNotice(notice)}
                  >
                    <div className={styles.listCardTop}>
                      {
                        notice.isPopup ? (
                          <span className={styles.orderBadge}>팝업</span> 
                        ) : (
                          <span></span>
                        )
                      }
                      <ArrowUpRight size={14} />
                    </div>

                    <strong className={styles.listCardTitle}>{notice.title}</strong>
                    <p className={styles.listCardText}>
                      {notice.summary || '등록된 공지 내용이 없습니다.'}
                    </p>

                    <div className={styles.listCardMeta}>
                      {
                        notice.isPopup ? (
                          <span>{`${notice.popupStartDate} ~ ${notice.popupEndDate}`}</span>  
                        ) : (
                          <span></span>
                        )
                      }
                      <span>{notice.createdAt}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>

        <section className={styles.detailPanel}>
          {mode === NOTICE_MODES.CREATE || mode === NOTICE_MODES.EDIT ? (
            <NoticeForm
              mode={mode}
              form={form}
              onChange={handleFormChange}
              onCancel={handleCancelEditor}
              onSubmit={handleSubmit}
            />
          ) : mode === NOTICE_MODES.DETAIL && selectedNotice ? (
            <NoticeDetail notice={selectedNotice} onEdit={handleOpenEdit} onDelete={handleDelete} />
          ) : (
            <div className={styles.detailEmpty}>
              <BellRing size={18} />
              좌측 목록에서 공지사항을 선택하거나 새 공지를 추가해 주세요.
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default NoticeManagementPage
