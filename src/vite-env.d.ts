/// <reference types="vite/client" />

// CSS Module import를 타입스크립트가 문자열 맵으로 이해하도록 선언한다.
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

// 정적 에셋 import를 문자열 URL로 다루기 위한 선언이다.
declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}
