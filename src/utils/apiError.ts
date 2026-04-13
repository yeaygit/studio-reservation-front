import axios from 'axios'

interface ApiErrorBody {
  errorMessage?: string
}

// axios 에러 여부를 확인한 뒤 서버 메시지가 있으면 꺼내고, 없으면 기본 문구를 사용한다.
export const getApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.errorMessage || fallbackMessage
  }

  if (error instanceof Error && error.message.trim() !== '') {
    return error.message
  }

  return fallbackMessage
}
