import IntroPage from '../pages/IntroPage'
import LoginPage from '../pages/LoginPage'
import PricingPage from '../pages/PricingPage'
import ReservationCheckPage from '../pages/ReservationCheckPage'
import ReservationPage from '../pages/ReservationPage'
import ServiceCostumePage from '../pages/ServiceCostumePage'
import ShootingTypePage from '../pages/ShootingTypePage'

export const publicRouteConfigs = [
  {
    path: '/',
    component: IntroPage,
  },
  {
    path: '/service/type',
    component: ShootingTypePage,
  },
  {
    path: '/service/costume',
    component: ServiceCostumePage,
  },
  {
    path: '/reservation/check',
    component: ReservationCheckPage,
  },
  {
    path: '/reservation',
    component: ReservationPage,
  },
  {
    path: '/login',
    component: LoginPage,
  },
]

export const publicFallbackPath = '/'
