import type { ComponentType } from 'react'

// 라우트와 메뉴 데이터는 여러 레이아웃 컴포넌트가 함께 사용하므로 공통 타입으로 분리한다.
export interface AppRouteConfig {
  path: string
  label?: string
  description?: string
  component: ComponentType
  props?: Record<string, unknown>
}

export interface NavigationItem {
  label: string
  path?: string
  id?: string
}

export interface NavigationMenu {
  label: string
  items: NavigationItem[]
  path?: string
}
