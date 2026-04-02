import { useNavigate } from 'react-router-dom'
import { adminMenus, publicMenus } from '../../routes/navigation'
import useAuthStore, { selectIsAuthenticated } from '../../store/useAuthStore'

const Sidebar = ({ setSidebarOpen }) => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  const menus = isAuthenticated ? adminMenus : publicMenus

  const navigateToMenuItem = (item) => {
    setSidebarOpen(false)

    if (item.id) {
      navigate('/')
      setTimeout(() => {
        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return
    }

    if (item.path) {
      navigate(item.path)
    }
  }

  return (
    <div className="sidebar-bg" onClick={() => setSidebarOpen(false)}>
      <div className="sidebar" onClick={(event) => event.stopPropagation()}>
        <nav className="sidebar-nav">
          {menus.map((menu) => (
            <div key={menu.label} className="sidebar-section">
              {menu.path ? (
                <button
                  className="sidebar-label"
                  onClick={() => navigateToMenuItem(menu)}
                  type="button"
                >
                  {menu.label}
                </button>
              ) : (
                <div className="sidebar-label">{menu.label}</div>
              )}

              {menu.items.map((item) => (
                <button
                  key={item.label}
                  className="sidebar-item"
                  onClick={() => navigateToMenuItem(item)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
