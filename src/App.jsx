import { useEffect, useState } from 'react'
import Header from './component/layout/Header'
import './App.css'
import Body from './component/layout/Body'
import Sidebar from './component/layout/Sidebar'
import Footer from './component/layout/Footer'
import useAuthStore, { subscribeToAuthSync } from './store/useAuthStore'

function App() {
  // 모바일에서만 사용하는 사이드바 열림 상태입니다.
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // 앱 시작 시 refresh cookie로 access token을 복구하는 함수입니다.
  const restoreSession = useAuthStore((state) => state.restoreSession)
  // 현재 탭의 인증 상태를 비우는 함수입니다.
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    // 데스크톱 너비로 돌아오면 모바일 오버레이 사이드바를 강제로 닫아
    // 레이아웃이 겹치지 않도록 맞춰줍니다.
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // 모바일 사이드바가 열려 있을 때는 배경 스크롤을 막아서
    // 오버레이 뒤쪽 화면이 같이 움직이지 않게 합니다.
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [sidebarOpen])

  useEffect(() => {
    // access token은 메모리에만 있으므로 새로고침 직후에는 비어 있습니다.
    // 앱이 시작되면 refresh cookie를 사용해 세션을 한 번 복구합니다.
    void restoreSession()
  }, [restoreSession])

  useEffect(() => {
    // 다른 탭에서 로그인/로그아웃이 발생하면 현재 탭도 그 변화를 따라갑니다.
    // LOGIN 신호를 받으면 refresh로 현재 탭의 access token을 새로 발급받고,
    // LOGOUT 신호를 받으면 현재 탭 메모리 상태만 비웁니다.
    return subscribeToAuthSync({
      onLogin: () => restoreSession(),
      onLogout: () => clearAuth({ broadcast: false }),
    })
  }, [clearAuth, restoreSession])

  return (
    <div className="app">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {sidebarOpen && <Sidebar setSidebarOpen={setSidebarOpen} />}
      <Body />
      <Footer />
    </div>
  )
}

export default App
