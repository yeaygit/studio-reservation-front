import { Navigate, Route, Routes } from 'react-router-dom'
import useAuthStore, { selectIsAuthenticated } from '../../store/useAuthStore'
import { adminFallbackPath, adminRouteConfigs } from '../../routes/adminRouteConfigs'
import { publicFallbackPath, publicRouteConfigs } from '../../routes/publicRouteConfigs'

const Body = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const routeConfigs = isAuthenticated ? adminRouteConfigs : publicRouteConfigs
  const fallbackPath = isAuthenticated ? adminFallbackPath : publicFallbackPath

  return (
    <div className="body">
      <Routes>
        {routeConfigs.map(({ path, component: Component, props }) => (
          <Route key={path} path={path} element={<Component {...props} />} />
        ))}
        {isAuthenticated && <Route path="/login" element={<Navigate to="/admin" replace />} />}
        <Route path="*" element={<Navigate to={fallbackPath} replace />} />
      </Routes>
    </div>
  )
}

export default Body
