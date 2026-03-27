import customAxios from './customAxios'

export const login = async ({ username, password }) => {
  const payload = { username: username, password }

  try {
    const response = await customAxios.post('/auth/login', payload)

    return response.data
  } catch (error) {
    const message =
      error?.response?.data?.errorMessage ??
      '로그인에 실패했습니다. 아이디와 비밀번호를 다시 확인해주세요.'

    throw new Error(message)
  }
}

export const logout = async () => {
  try {
    await customAxios.post('/auth/logout')
    sessionStorage.removeItem('Access')
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.response?.data?.errorMessage ??
      '로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.'

    throw new Error(message)
  }
}
