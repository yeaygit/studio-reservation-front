import { startTransition, useDeferredValue, useEffect, useEffectEvent, useState } from 'react'
import {
  ArrowUpRight,
  CircleDollarSign,
  FileQuestion,
  Hash,
  Plus,
  Search,
  Sparkles,
  Timer
} from 'lucide-react'
import customAxios from '../../utils/customAxios'
import { CRUD_PAGE_MODES as PHOTO_TYPE_MODES } from '../../constants/pageModes'
import styles from '../../styles/PhotoTypeSettingPage.module.css'
import PhotoTypeForm from '../../component/setting/PhotoTypeForm'
import PhotoTypeDetail from '../../component/setting/PhotoTypeDetail'
import { formatPrice } from '../../utils/formatSetting'

const INITIAL_FORM = {
  code: '',
  label: '',
  duration: '',
  price: '',
  description: '',
  sortOrder: '',
}


const createDescriptionSummary = (value) => {
  const normalizedValue = String(value ?? '').replace(/\s+/g, ' ').trim()

  if (!normalizedValue) {
    return '설명이 아직 없습니다.'
  }

  if (normalizedValue.length <= 70) {
    return normalizedValue
  }

  return `${normalizedValue.slice(0, 70)}...`
}


const PhotoTypeSettingPage = () => {
  const [shootingTypes, setShootingTypes] = useState([])
  const [selectedShootingType, setSelectedShootingType] = useState(null)

  const [mode, setMode] = useState(PHOTO_TYPE_MODES.LIST)
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
  const filteredShootingTypes = normalizedSearch
    ? shootingTypes.filter((shootingType) =>
        `${shootingType.id ?? ''} ${shootingType.code} ${shootingType.label} ${
          shootingType.description ?? ''
        }`
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : shootingTypes

  const loadShootingTypes = async (selectedIdToKeep = selectedShootingType?.id ?? null) => {

    try {
      const response = await customAxios.get('/admin/settings/shooting-types')

      startTransition(() => {
        setShootingTypes(response.data)

        if (selectedIdToKeep) {
          const matchedShootingType = response.data.find(
            ({ id }) => id === selectedIdToKeep,
          )

          if (matchedShootingType) {
            setSelectedShootingType((previous) => ({
              ...previous,
              ...matchedShootingType,
            }))
            return
          }
        }

        if (!selectedIdToKeep && mode === PHOTO_TYPE_MODES.DETAIL) {
          setSelectedShootingType(null)
          setMode(PHOTO_TYPE_MODES.LIST)
        }
      })

      return response.data
    } catch (error) {
      setErrorMessage(error.response.data.errorMessage || '촬영 유형 목록을 불러오지 못했습니다.')
      return []
    }
  }

  const getShootingTypeById = async (shootingTypeId) => {
    try {
      const response = await customAxios.get(`/admin/settings/shooting-types/${shootingTypeId}`)
      return response.data
    } catch (error) {
      setErrorMessage(error.response.data.errorMessage || '촬영 유형 상세 정보를 불러오지 못했습니다.')
      return null
    }
  }


  useEffect(() => {
    void loadShootingTypes(null)
  }, [])

  const handleSearchChange = ({ target: { value } }) => {
    setSearchQuery(value)
  }

  const handleFormChange = ({ target: { name, value } }) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSelectShootingType = async (shootingType) => {
    clearMessages()
    startTransition(() => setMode(PHOTO_TYPE_MODES.DETAIL))

    const detailShootingType = await getShootingTypeById(shootingType.id)

    if (detailShootingType) {
      startTransition(() => {
        setSelectedShootingType(detailShootingType)
      })
    }

  }

  const handleOpenCreate = () => {
    clearMessages()
    setForm(INITIAL_FORM)
    startTransition(() => setMode(PHOTO_TYPE_MODES.CREATE))
  }

  const handleOpenEdit = () => {
    if (!selectedShootingType) {
      return
    }

    clearMessages()
    setForm(selectedShootingType)
    startTransition(() => setMode(PHOTO_TYPE_MODES.EDIT))
  }

  const handleCancelEditor = () => {
    clearMessages()
    setForm(INITIAL_FORM)
    startTransition(() => {
      setMode(selectedShootingType ? PHOTO_TYPE_MODES.DETAIL : PHOTO_TYPE_MODES.LIST)
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    clearMessages()

    const code = form.code.trim()
    const label = form.label.trim()
    const description = form.description.trim()
    const duration = Number(form.duration)
    const price = Number(form.price)
    const sortOrder = form.sortOrder !== '' ? Number(form.sortOrder) : null

    if (mode === PHOTO_TYPE_MODES.CREATE && !code) {
      setErrorMessage('코드를 입력해 주세요.')
      return
    }
    if (!label) {
      setErrorMessage('촬영 유형명을 입력해 주세요.')
      return
    }
    if (!Number.isInteger(duration) || duration <= 0) {
      setErrorMessage('촬영 시간은 1 이상의 정수로 입력해 주세요.')
      return
    }
    if (!Number.isInteger(price) || price < 0) {
      setErrorMessage('금액은 0 이상의 정수로 입력해 주세요.')
      return
    }
    if (mode === PHOTO_TYPE_MODES.EDIT && (sortOrder === null || !Number.isInteger(sortOrder) || sortOrder < 0)) {
      setErrorMessage('노출 순서는 0 이상의 정수로 입력해 주세요.')
      return
    }

    const payload = {
      label,
      duration,
      price,
      description: description || null,
      ...(mode === PHOTO_TYPE_MODES.CREATE && { code }),
      ...(mode === PHOTO_TYPE_MODES.EDIT && { sortOrder }),
    }

    try {
      const response =
        mode === PHOTO_TYPE_MODES.CREATE
          ? await customAxios.post('/admin/settings/shooting-types', payload)
          : await customAxios.patch(`/admin/settings/shooting-types/${selectedShootingType.id}`, payload)

      const savedShootingType = response.data

      startTransition(() => {
        setSelectedShootingType(savedShootingType)
        setForm(INITIAL_FORM)
        setMode(PHOTO_TYPE_MODES.DETAIL)
      })

      setSuccessMessage(mode === PHOTO_TYPE_MODES.CREATE ? '촬영 유형을 등록했습니다.' : '촬영 유형을 수정했습니다.')
      await loadShootingTypes(savedShootingType.id)
    } catch (error) {
      setErrorMessage(
        error.response.data.errorMessage ||
          (mode === PHOTO_TYPE_MODES.CREATE ? '촬영 유형을 등록하지 못했습니다.' : '촬영 유형을 수정하지 못했습니다.')
      )
    }
  }

  const handleDelete = async () => {
    if (!selectedShootingType?.id) {
      return
    }

    clearMessages()

    try {
      await customAxios.delete(`/admin/settings/shooting-types/${selectedShootingType.id}`)

      startTransition(() => {
        setSelectedShootingType(null)
        setMode(PHOTO_TYPE_MODES.LIST)
      })

      setSuccessMessage('촬영 유형을 삭제했습니다.')
      await loadShootingTypes(null)
    } catch (error) {
      setErrorMessage(error.response.data.errorMessage || '촬영 유형을 삭제하지 못했습니다.')
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.title}>촬영 유형 설정</h1>
          <p className={styles.description}>
            전체 촬영 유형을 확인하고, 우측 패널에서는 단건 조회와 편집을 바로 이어서 처리할 수 있습니다.
          </p>
        </div>

        <div className={styles.heroStats}>
          <article className={styles.heroStatCard}>
            <span className={styles.statLabel}>전체 유형</span>
            <strong className={styles.statValue}>{shootingTypes.length}개</strong>
            <p className={styles.statHelper}>현재 등록된 촬영 상품 수입니다.</p>
          </article>
        </div>
      </div>

      {successMessage.trim() !== '' && (
        <div className={styles.feedbackSuccess} role="status">
          {successMessage}
        </div>
      )}

      {errorMessage.trim() !== '' && (
        <div className={styles.feedbackError} role="alert">
          {errorMessage}
        </div>
      )}

      <div className={styles.workspace}>
        <section className={styles.listPanel}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleBlock}>
              <h2 className={styles.sectionTitle}>촬영 유형 목록</h2>
              <p className={styles.sectionDescription}>
                검색으로 빠르게 찾고, 카드를 눌러 상세 데이터를 확인하세요.
              </p>
            </div>

            <div className={styles.toolbarActions}>
              <button
                className={`${styles.primaryButton} ${styles.addButton}`}
                type="button"
                onClick={handleOpenCreate}
              >
                <span className={styles.buttonIcon}>
                  <Plus size={15} strokeWidth={2.4} />
                </span>
                <span className={styles.buttonLabel}>추가</span>
              </button>
            </div>
          </div>

          <div className={styles.searchField}>
            <Search size={16} />
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="이름, 코드, 설명, ID로 검색"
              aria-label="촬영 유형 검색"
            />
          </div>

          <div className={styles.listMeta}>
            <span>전체 {shootingTypes.length}개</span>
          </div>

          <div className={styles.listBody}>
            {filteredShootingTypes.length === 0 ? (
              <div className={styles.listEmpty}>
                <Sparkles size={18} />
                {normalizedSearch
                  ? '검색 결과가 없습니다. 다른 검색어로 다시 확인해 주세요.'
                  : '등록된 촬영 유형이 없습니다. 첫 항목을 추가해 보세요.'}
              </div>
            ) : (
              filteredShootingTypes.map((shootingType) => {
                const isActiveCard =
                  mode !== PHOTO_TYPE_MODES.CREATE &&
                  mode !== PHOTO_TYPE_MODES.EDIT &&
                  selectedShootingType?.id === shootingType.id

                return (
                  <button
                    key={shootingType.id ?? shootingType.code}
                    className={`${styles.listCard} ${isActiveCard ? styles.listCardActive : ''}`}
                    type="button"
                    onClick={() => handleSelectShootingType(shootingType)}
                  >
                    <div className={styles.listCardTop}>
                      <div className={styles.detailBadgeRow}>
                        <span className={styles.codeBadge}>{shootingType.code}</span>
                      </div>
                      <ArrowUpRight size={14} />
                    </div>

                    <strong className={styles.listCardTitle}>{shootingType.label}</strong>
                    <p className={styles.listCardText}>
                      {createDescriptionSummary(shootingType.description)}
                    </p>

                    <div className={styles.listCardMeta}>
                      <span className={styles.metaChip}>
                        <Timer size={14} />
                        {shootingType.duration}분
                      </span>
                      <span className={styles.metaChip}>
                        <CircleDollarSign size={14} />
                        {formatPrice(shootingType.price)}
                      </span>
                      <span className={styles.metaChip}>
                        <Hash size={14} />
                        순서 {shootingType.sortOrder ?? '미지정'}
                      </span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>

        <section className={styles.detailPanel}>
          {mode === PHOTO_TYPE_MODES.CREATE || mode === PHOTO_TYPE_MODES.EDIT ? (
            <PhotoTypeForm
              mode={mode}
              form={form}
              shootingType={selectedShootingType}
              onChange={handleFormChange}
              onCancel={handleCancelEditor}
              onSubmit={handleSubmit}
            />
          ) : mode === PHOTO_TYPE_MODES.DETAIL && selectedShootingType ? (
            <PhotoTypeDetail
              shootingType={selectedShootingType}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ) : (
            <div className={styles.detailEmpty}>
              <FileQuestion size={18} />
              목록에서 촬영 유형을 선택하거나 새 항목을 등록해 주세요.
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default PhotoTypeSettingPage
