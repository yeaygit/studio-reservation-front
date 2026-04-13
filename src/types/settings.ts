export interface ShootingType {
  id?: number
  code: string
  label: string
  duration: number | string
  price: number | string
  description?: string | null
  sortOrder?: number | string | null
}

export interface PhotoTypeFormState {
  code: string
  label: string
  duration: string
  price: string
  description: string
  sortOrder: string
}

export type ClosedDayType = 'SPECIFIC' | 'ANNUAL'

export interface ClosedDay {
  id?: number
  type: ClosedDayType
  closedDate?: string | null
  specificDate?: string | null
  annualMonth?: number | null
  annualDay?: number | null
}

export interface ClosedDayFormState {
  type: ClosedDayType
  specificDate: string
  annualMonth: string
  annualDay: string
}

export type ClosedDayKey =
  | 'closedSun'
  | 'closedMon'
  | 'closedTue'
  | 'closedWed'
  | 'closedThu'
  | 'closedFri'
  | 'closedSat'

export interface StudioSettingFormState {
  openTime: string
  closeTime: string
  lunchStart: string
  lunchEnd: string
  slotUnit: string
  reservationOpenDays: string
  closedSun: boolean
  closedMon: boolean
  closedTue: boolean
  closedWed: boolean
  closedThu: boolean
  closedFri: boolean
  closedSat: boolean
}

export interface StudioSettingResponse {
  openTime?: string | number[] | null
  closeTime?: string | number[] | null
  lunchStart?: string | number[] | null
  lunchEnd?: string | number[] | null
  slotUnit?: number | string | null
  reservationOpenDays?: number | string | null
  closedSun?: boolean
  closedMon?: boolean
  closedTue?: boolean
  closedWed?: boolean
  closedThu?: boolean
  closedFri?: boolean
  closedSat?: boolean
}
