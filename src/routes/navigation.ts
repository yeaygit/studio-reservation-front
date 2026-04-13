import type { NavigationMenu } from './routeTypes'

// 헤더와 사이드바에서 공통으로 쓰는 메뉴 정보를 한곳에 모아둔다.
export const adminMenus: NavigationMenu[] = [
  {
    label: '운영 관리',
    items: [
      { label: '예약내역 관리', path: '/admin/reservations' },
      { label: '예약 시간 설정', path: '/admin/reservation-settings' },
      { label: '휴일 관리', path: '/admin/holidays' },
      { label: '블랙리스트 차단', path: '/admin/blacklist' },
    ],
  },
  {
    label: '콘텐츠 관리',
    items: [
      { label: '카카오 알림톡 문구 관리', path: '/admin/alimtalk' },
      { label: '약관 관리', path: '/admin/terms' },
      { label: '공지사항 관리', path: '/admin/notice' },
      { label: 'FAQ 관리', path: '/admin/faq' },
      { label: '사진 타입 설정', path: '/admin/photo-types' },
    ],
  },
]

export const publicMenus: NavigationMenu[] = [
  {
    label: '소개',
    items: [
      { label: '공간 & 시설 안내', id: 'facility' },
      { label: '포트폴리오 갤러리', id: 'gallery' },
      { label: '공지사항', id: 'notice' },
      { label: 'FAQ', id: 'faq' },
    ],
    path: '/',
  },
  {
    label: '서비스',
    items: [
      { label: '촬영 종류 안내', path: '/service/type' },
      { label: '의상 & 소품 안내', path: '/service/costume' },
    ],
  },
  {
    label: '예약 확인',
    items: [],
    path: '/reservation/check',
  },
  {
    label: '예약하기',
    items: [],
    path: '/reservation',
  },
]
