import { useEffect, useState } from 'react'
import Header from './component/layout/Header'
import './App.css'
import Body from './component/layout/Body'
import Sidebar from './component/layout/Sidebar'
import Footer from './component/layout/Footer'

function App() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 화면 크기 바뀔 때 768px 이상이면 사이드바 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div className="app">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
      {
        sidebarOpen && (
          <Sidebar setSidebarOpen={setSidebarOpen}/>
        )
      }
      <Body/>
      <Footer/>

    </div>
  )
}

export default App
