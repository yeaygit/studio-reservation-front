import { Navigate, Route, Routes } from 'react-router-dom'
import useAuthStore, { selectIsAuthenticated, selectIsAuthReady } from '../../store/useAuthStore'
import { adminFallbackPath, adminRouteConfigs } from '../../routes/adminRouteConfigs'
import { publicFallbackPath, publicRouteConfigs } from '../../routes/publicRouteConfigs'

const Body = () => {
  // isAuthReady는 "로그인 여부"가 아니라
  // "refresh를 통한 세션 확인까지 끝났는지"를 뜻합니다.
  const isAuthReady = useAuthStore(selectIsAuthReady)
  // access token이 메모리에 있으면 로그인된 것으로 간주합니다.
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  // 로그인 상태에 따라 사용할 라우트 집합을 완전히 분리합니다.
  const routeConfigs = isAuthenticated ? adminRouteConfigs : publicRouteConfigs
  const fallbackPath = isAuthenticated ? adminFallbackPath : publicFallbackPath

  if (!isAuthReady) {
    // 앱 시작 직후에는 아직 /auth/refresh 결과를 모르는 상태라서
    // 성급하게 public/admin 라우트를 확정하면 화면이 잠깐 튈 수 있습니다.
    // 인증 확인이 끝날 때까지는 빈 body만 렌더링해 깜빡임을 줄입니다.
    return <div className="body" />
  }

  return (
    <div className="body">
      <Routes>
        // 현재 인증 상태에 맞는 라우트 목록만 렌더링합니다.
        {routeConfigs.map(({ path, component: Component, props }) => (
          <Route key={path} path={path} element={<Component {...props} />} />
        ))}
        // 이미 로그인된 사용자가 /login으로 오면 관리자 홈으로 돌려보냅니다.
        {isAuthenticated && <Route path="/login" element={<Navigate to="/admin" replace />} />}
        // 정의되지 않은 경로는 로그인 상태에 맞는 기본 경로로 보냅니다.
        <Route path="*" element={<Navigate to={fallbackPath} replace />} />
      </Routes>
    </div>
  )
}

export default Body
