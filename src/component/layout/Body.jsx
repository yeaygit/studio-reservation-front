import React from 'react'
import { Routes, Route } from 'react-router'
import IntroPage from '../../pages/IntroPage'
import ReservationPage from '../../pages/ReservationPage'
import ReservationCheckPage from '../../pages/ReservationCheckPage'
import PricingPage from '../../pages/PricingPage'
import ShootingTypePage from '../../pages/ShootingTypePage'
import LoginPage from '../../pages/LoginPage'

const Body = () => {
  return (
    <div className='body'>
      <Routes>
        <Route path='/' element={<IntroPage />}/>
        <Route path="/service/type" element={<ShootingTypePage />} />
        <Route path="/service/pricing" element={<PricingPage />} />
        <Route path="/reservation/check" element={<ReservationCheckPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  )
}

export default Body
