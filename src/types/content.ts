export interface Faq {
  id?: number
  question: string
  answer: string
  sortOrder?: number | null
  summary?: string
  createdAt?: string
}

export interface FaqFormState {
  question: string
  answer: string
  sortOrder: number | null
}

export interface Notice {
  id?: number
  title: string
  content: string
  isPopup: boolean
  popupStartDate: string | null
  popupEndDate: string | null
  createdAt?: string
  summary?: string
}

export interface NoticeFormState {
  title: string
  content: string
  isPopup: boolean
  popupStartDate: string
  popupEndDate: string
}

export interface TermsItem {
  id?: number
  title: string
  content: string
  isRequired: boolean
  createdAt?: string
  summary?: string
}

export interface TermsFormState {
  title: string
  content: string
  isRequired: boolean
}
