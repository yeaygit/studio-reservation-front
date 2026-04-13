export const formatPrice = (value: number | string | null | undefined): string =>
  `${Number(value ?? 0).toLocaleString('ko-KR')}원`
