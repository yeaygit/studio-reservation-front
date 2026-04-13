import type { Dispatch, MouseEvent as ReactMouseEvent, SetStateAction } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import logo from '../../assets/logo/romiLogo.jpg'
import { adminMenus, publicMenus } from '../../routes/navigation'
import useAuthStore, { selectIsAuthenticated } from '../../store/useAuthStore'
import type { NavigationItem, NavigationMenu } from '../../routes/routeTypes'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: Dispatch<SetStateAction<boolean>>
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  const menus: NavigationMenu[] = isAuthenticated ? adminMenus : publicMenus

  const navigateToMenuItem = (item: NavigationItem) => {
    setOpenMenu(null)

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

  const handleButtonClick = (menu: NavigationMenu) => {
    if (!menu.items.length) {
      setOpenMenu(null)
      navigate(menu.path)
      return
    }

    setOpenMenu((prev) => (prev === menu.label ? null : menu.label))
  }

  useEffect(() => {
    setOpenMenu(null)
  }, [location.pathname, isAuthenticated])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="header" ref={headerRef}>
      <button
        className="header-brand"
        type="button"
        onClick={() => navigate(isAuthenticated ? '/admin' : '/')}
      >
        <img src={logo} className="header-logo" alt="logo" />
        <span className="header-title">Romi studio</span>
      </button>

      <nav className="header-nav">
        {menus.map((menu, index) => {
          const hasItems = menu.items.length > 0
          const isOpen = openMenu === menu.label
          const shouldAlignRight = index === menus.length - 1

          return (
            <div key={menu.label} className="header-menu-item">
              <button
                className={`header-btn ${isOpen ? 'header-btn--active' : ''}`}
                onClick={() => handleButtonClick(menu)}
                type="button"
              >
                {menu.label}
                {hasItems && (
                  <svg
                    className={`header-btn-arrow ${isOpen ? 'header-btn-arrow--open' : ''}`}
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                  >
                    <path
                      d="M1 1l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              {hasItems && isOpen && (
                <div
                  className={`header-dropdown ${
                    shouldAlignRight ? 'header-dropdown--align-right' : ''
                  }`}
                >
                  {menu.items.map((item) => (
                    <button
                      key={item.label}
                      className="header-dropdown-item"
                      onClick={() => navigateToMenuItem(item)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <button
        className="menu-icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        type="button"
      >
        <Menu size={24} />
      </button>
    </div>
  )
}

export default Header
