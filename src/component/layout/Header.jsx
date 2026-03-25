import React, { useEffect, useRef, useState } from 'react'
import logo from '../../assets/logo/romiLogo.jpg'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { useNavigate } from 'react-router'

const MENUS = [
  {
    label: '소개',
    items: [
      { label: '공간 & 시설 안내', id: 'facility' },   // 스크롤
      { label: '포트폴리오 갤러리', id: 'gallery' },
      { label: '공지사항 & FAQ', id: 'faq' },
    ],
    path: '/',
  },
  {
    label: '서비스',
    items: [
      { label: '촬영 종류 안내', path: '/service/type' },
      { label: '요금표',         path: '/service/pricing' },
      { label: '의상 & 소품 안내', path: '/service/costume' },
    ],
  },
  {
    label: '예약확인',
    items: [],
    path: '/reservation/check',
  },
  {
    label: '예약하기',
    items: [],
    path: '/reservation',
  },
]


const Header = ({sidebarOpen, setSidebarOpen}) => {

  const [openMenu, setOpenMenu] = useState(null)
  const headerRef = useRef(null)
  const navigate = useNavigate()
  
  const handleButtonClick = (label, hasItems, path) => {
    if (!hasItems) {
      setOpenMenu(null)
      navigate(path)
      return
    }
    setOpenMenu((prev) => (prev === label ? null : label))
  }

  const handleItemClick = (item) => {
    setOpenMenu(null)
    if (item.id) {
      // 소개 페이지 섹션 스크롤
      navigate('/')
      setTimeout(() => {
        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      navigate(item.path)
    }
  }
  
  // 드롭다운 — 헤더 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='header' ref={headerRef}>
      <div className="header-brand">
        <img src={logo} className="header-logo" alt="logo" />
        <span className="header-title">Romi studio</span>
      </div>
      <nav className="header-nav">
        {MENUS.map(({ label, items, path }) => {
          const hasItems = items.length > 0
          const isOpen = openMenu === label
          return (
            <div key={label} className="header-menu-item">
              <button
                className={`header-btn ${isOpen ? 'header-btn--active' : ''}`}
                onClick={() => handleButtonClick(label, hasItems, path)}
                >
                {label}
                {hasItems && (
                  <svg
                    className={`header-btn-arrow ${isOpen ? 'header-btn-arrow--open' : ''}`}
                    width="10" height="6" viewBox="0 0 10 6" fill="none"
                  >
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {hasItems && isOpen && (
                <div className="header-dropdown">
                  {items.map((item) => (
                    <button
                      key={item.label}
                      className="header-dropdown-item"
                      onClick={() => {
                        setOpenMenu(null)
                        handleItemClick(item)
                      }}
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
      <button className='menu-icon' onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu size={24}/>
      </button>
    </div>
  )
}

export default Header
