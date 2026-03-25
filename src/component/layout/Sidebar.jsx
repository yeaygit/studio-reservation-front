import React from 'react'

const MENUS = [
  {
    label: '소개',
    items: ['공간 & 시설 안내', '포트폴리오 갤러리', '공지사항 & FAQ'],
  },
  {
    label: '서비스',
    items: ['촬영 종류 안내', '요금표', '의상 & 소품 안내'],
  },
  {
    label: '예약확인',
    items: ['예약 조회'],
  },
  {
    label: '예약하기',
    items: ['예약 하기'],
  },
]

const Sidebar = ({setSidebarOpen}) => {
  return (
    <div className='sidebar-bg' onClick={() => setSidebarOpen(false)}>
      <div className='sidebar' onClick={(e) => e.stopPropagation()}>    
        <nav className="sidebar-nav">
          {MENUS.map(({ label, items }) => (
            <div key={label} className="sidebar-section">
              <button
                className="sidebar-label"
                onClick={() => {
                  if (!items.length) setSidebarOpen(false)
                  // TODO: navigate
                }}
              >
                {label}
              </button>
              {items.map((item) => (
                <button
                  key={item}
                  className="sidebar-item"
                  onClick={() => setSidebarOpen(false)}
                >
                  {item}
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
