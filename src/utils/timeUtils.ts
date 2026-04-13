export const timeToMin = (value: string | number | null | undefined): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (value === null || value === undefined || value === '') {
    return Number.NaN
  }

  const [hour = '0', minute = '0'] = String(value).split(':')
  return Number(hour) * 60 + Number(minute)
}

export const minToTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
