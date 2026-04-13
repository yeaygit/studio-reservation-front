import IntroPage from '../pages/service/IntroPage'
import LoginPage from '../pages/auth/LoginPage.tsx'
import PricingPage from '../pages/service/PricingPage'
import ReservationCheckPage from '../pages/service/ReservationCheckPage'
import ReservationPage from '../pages/service/ReservationPage'
import ServiceCostumePage from '../pages/service/ServiceCostumePage'
import ShootingTypePage from '../pages/service/ShootingTypePage'
import type { AppRouteConfig } from './routeTypes'

// 비로그인 사용자에게 보여줄 공개 라우트 목록이다.
export const publicRouteConfigs: AppRouteConfig[] = [
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
