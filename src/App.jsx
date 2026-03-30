import { useEffect, useState } from 'react'
import Header from './component/layout/Header'
import './App.css'
import Body from './component/layout/Body'
import Sidebar from './component/layout/Sidebar'
import Footer from './component/layout/Footer'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
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
