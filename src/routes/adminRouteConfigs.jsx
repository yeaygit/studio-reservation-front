import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminPlaceholderPage from '../pages/admin/AdminPlaceholderPage'
import FaqManagementPage from '../pages/faq/FaqManagementPage'
import NoticeManagementPage from '../pages/notice/NoticeManagementPage'

export const adminRouteConfigs = [
  {
    path: '/admin',
    label: '대시보드',
    description: '오늘 예약 수, 이번 달 매출, 최근 예약 상태를 한눈에 확인합니다.',
    component: AdminDashboardPage,
  },
  {
    path: '/admin/reservations',
    label: '예약내역 관리',
    description: '예약 목록과 상태, 고객 요청 사항을 관리합니다.',
    component: AdminPlaceholderPage,
    props: {
      title: '예약내역 관리',
      description: '예약 목록과 상태, 고객 요청 사항을 관리합니다.',
    },
  },
  {
    path: '/admin/reservation-settings',
    label: '예약 시간 설정',
    description: '예약 가능한 시간대와 기본 운영 슬롯을 설정합니다.',
    component: AdminPlaceholderPage,
    props: {
      title: '예약 시간 설정',
      description: '예약 가능한 시간대와 기본 운영 슬롯을 설정합니다.',
    },
  },
  {
    path: '/admin/holidays',
    label: '휴일 관리',
    description: '정기 휴무일과 임시 휴무일을 등록하고 노출합니다.',
    component: AdminPlaceholderPage,
    props: {
      title: '휴일 관리',
      description: '정기 휴무일과 임시 휴무일을 등록하고 노출합니다.',
    },
  },
  {
    path: '/admin/blacklist',
    label: '블랙리스트 차단',
    description: '예약 제한이 필요한 고객을 등록하고 관리합니다.',
    component: AdminPlaceholderPage,
    props: {
      title: '블랙리스트 차단',
      description: '예약 제한이 필요한 고객을 등록하고 관리합니다.',
    },
  },
  {
    path: '/admin/alimtalk',
    label: '카카오 알림톡 문구 관리',
    description: '예약 안내, 확정, 취소 알림에 사용할 문구를 관리합니다.',
    component: AdminPlaceholderPage,
    props: {
      title: '카카오 알림톡 문구 관리',
      description: '예약 안내, 확정, 취소 알림에 사용할 문구를 관리합니다.',
    },
  },
  {
    path: '/admin/terms',
    label: '약관 관리',
    description: '예약 약관과 동의 문구를 수정하고 버전을 관리합니다.',
    component: AdminPlaceholderPage,
    props: {
      title: '약관 관리',
      description: '예약 약관과 동의 문구를 수정하고 버전을 관리합니다.',
    },
  },
  {
    path: '/admin/notice',
    label: '공지사항 관리',
    description: '공지사항을 등록하고 수정합니다.',
    component: NoticeManagementPage,
  },
  {
    path: '/admin/faq',
    label: 'FAQ 관리',
    description: '자주 묻는 질문을 등록하고 수정합니다.',
    component: FaqManagementPage,
  },
  {
    path: '/admin/photo-types',
    label: '사진 type 설정',
    description: '촬영 타입과 사진 분류 옵션을 설정합니다.',
    component: AdminPlaceholderPage,
    props: {
      title: '사진 type 설정',
      description: '촬영 타입과 사진 분류 옵션을 설정합니다.',
    },
  },
]

export const adminFallbackPath = '/admin'
