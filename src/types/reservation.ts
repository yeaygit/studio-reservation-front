import type { Dispatch, SetStateAction } from 'react'

export type ReservationStep = 'TYPE' | 'SCHEDULE' | 'INFO' | 'CONFIRM'

export interface ReservationTypeItem {
  id?: number
  code: string
  label: string
  duration: number
  price: number
  description?: string | null
  sortOrder?: number | null
}

export interface ReservationTerm {
  id: number
  title: string
  content?: string
  isRequired: boolean
}

export interface ReservationFormState {
  type: string | null
  date: string
  headcount: number
  startTime: string
  endTime: string
  name: string
  phone: string
  visitPath: string
  requestMessage: string
  agreedTerms: number[]
}

export interface ReservationSettingResponse {
  openTime: number
  closeTime: number
  lunchStart: number
  lunchEnd: number
  slotUnit: number
  reservationOpenDays: number
  blockedDays: string[]
  closedDays: string[]
}

export interface ReservationSlot {
  time: string
  disabled: boolean
}

export interface BookedReservation {
  startTime?: string | null
  endTime?: string | null
  time?: string | null
  duration?: number | string | null
}

export interface BookedRange {
  start: number
  end: number
}

export interface ReservationInfoProps {
  form: ReservationFormState
  setForm: Dispatch<SetStateAction<ReservationFormState>>
  termsList: ReservationTerm[]
}

export interface ReservationTypeProps {
  form: ReservationFormState
  setForm: Dispatch<SetStateAction<ReservationFormState>>
  typeList: ReservationTypeItem[]
}

export interface ReservationScheduleProps {
  form: ReservationFormState
  setForm: Dispatch<SetStateAction<ReservationFormState>>
  typeList: ReservationTypeItem[]
}

export interface ReservationConfirmProps {
  reservationId: number | string | null
}
