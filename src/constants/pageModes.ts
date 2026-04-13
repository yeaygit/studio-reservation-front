// CRUD 화면에서 공통으로 쓰는 모드 문자열을 한곳에서 관리한다.
export const CRUD_PAGE_MODES = Object.freeze({
  LIST: 'list',
  DETAIL: 'detail',
  CREATE: 'create',
  EDIT: 'edit',
} as const)

export type CrudPageMode = (typeof CRUD_PAGE_MODES)[keyof typeof CRUD_PAGE_MODES]
