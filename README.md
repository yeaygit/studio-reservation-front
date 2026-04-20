# Romi Studio Reservation Frontend

Romi Studio 예약 서비스를 위한 프론트엔드 프로젝트입니다.  
React + Vite 기반으로 제작되었고, 비로그인 사용자를 위한 예약/안내 화면과 관리자 로그인 후 사용하는 운영 관리 화면을 한 애플리케이션 안에서 분리해 제공합니다.

## 프로젝트 목적

- 고객이 촬영 유형을 확인하고 예약을 진행할 수 있는 예약 UI 제공
- 관리자가 로그인 후 FAQ, 공지, 약관, 촬영 유형, 운영 시간, 휴무일을 관리할 수 있는 백오피스 제공
- access token / refresh cookie 기반 인증 흐름과 자동 세션 복구 처리

## 기술 스택

- React 19
- TypeScript
- Vite 8
- React Router 7
- Zustand
- Axios
- CSS Modules
- Lucide React
- Vercel 배포

## 주요 기능

### 사용자 영역

- `소개` 페이지에서 FAQ 목록 조회
- `촬영 종류 안내` 페이지에서 촬영 유형, 가격, 소요 시간 조회
- `예약하기` 4단계 플로우 제공
  - 촬영 유형 선택
  - 날짜/시간 선택
  - 예약자 정보 및 약관 동의 입력
  - 예약 완료 확인
- 예약 가능 시간 계산
  - 운영 시간
  - 점심 시간
  - 휴무일/차단일
  - 이미 예약된 시간대
- 관리자 로그인 페이지 제공

### 관리자 영역

로그인 후 공개 라우트 대신 관리자 전용 라우트와 메뉴가 노출됩니다.

- 대시보드 진입
- FAQ 관리
  - 목록 조회
  - 상세 조회
  - 등록
  - 수정
  - 삭제
- 공지사항 관리
  - 목록 조회
  - 상세 조회
  - 등록
  - 수정
  - 삭제
  - 팝업 공지 기간 설정
- 약관 관리
  - 목록 조회
  - 상세 조회
  - 등록
  - 수정
  - 삭제
  - 필수/선택 여부 설정
- 사진 타입 설정
  - 촬영 유형 목록 조회
  - 상세 조회
  - 등록
  - 수정
  - 삭제
  - 소요 시간, 가격, 정렬 순서 관리
- 예약 시간 설정
  - 운영 시작/종료 시간
  - 점심 시작/종료 시간
  - 예약 단위
  - 예약 오픈 일수
  - 정기 휴무 요일
- 휴일 관리
  - 특정일 휴무 등록
  - 매년 반복 휴무 등록
  - 연도별 조회
  - 삭제

## 관리자 테스트 계정

개발/테스트용 관리자 계정:

- ID: `ylkim`
- PW: `test1234!@`

주의:

- 이 계정 정보는 테스트 편의를 위한 값입니다.
- 외부 공개 환경이나 실서비스 배포 전에는 반드시 별도 계정으로 교체하는 것을 권장합니다.

## 라우트 구성

### 공개 라우트

| 경로 | 설명 | 상태 |
| --- | --- | --- |
| `/` | 소개/FAQ 화면 | 구현됨 |
| `/service/type` | 촬영 종류 안내 | 구현됨 |
| `/service/costume` | 의상 & 소품 안내 | 미구현 |
| `/reservation/check` | 예약 확인 | 미구현 |
| `/reservation` | 예약 플로우 | 구현됨 |
| `/login` | 관리자 로그인 | 구현됨 |

### 관리자 라우트

| 경로 | 설명 | 상태 |
| --- | --- | --- |
| `/admin` | 관리자 대시보드 | 미구현 |
| `/admin/reservations` | 예약내역 관리 | 미구현 |
| `/admin/reservation-settings` | 예약 시간 설정 | 구현됨 |
| `/admin/holidays` | 휴일 관리 | 구현됨 |
| `/admin/blacklist` | 블랙리스트 차단 | 미구현 |
| `/admin/alimtalk` | 카카오 알림톡 문구 관리 | 미구현 |
| `/admin/terms` | 약관 관리 | 구현됨 |
| `/admin/notice` | 공지사항 관리 | 구현됨 |
| `/admin/faq` | FAQ 관리 | 구현됨 |
| `/admin/photo-types` | 사진 타입 설정 | 구현됨 |

## 인증 및 세션 처리

- 로그인 성공 시 access token은 Zustand store 메모리에만 저장됩니다.
- refresh token은 HttpOnly cookie 사용을 전제로 동작합니다.
- 앱 시작 시 `/auth/session` 확인 후 필요할 때 `/auth/refresh`로 세션을 복구합니다.
- 일반 API 요청은 Axios interceptor에서 access token을 자동 첨부합니다.
- API 응답이 `401`이면 refresh를 시도한 뒤 기존 요청을 재시도합니다.
- 여러 탭에서 로그인/로그아웃 상태를 동기화하기 위해 `BroadcastChannel`을 사용하고, 미지원 환경에서는 `localStorage` 이벤트를 fallback으로 사용합니다.

## API 연동 포인트

### 인증

- `POST /auth/login`
- `GET /auth/session`
- `POST /auth/refresh`
- `POST /auth/logout`

### 사용자 기능

- `GET /v1/faq`
- `GET /v1/settings/shooting-types`
- `GET /v1/terms`
- `GET /v1/reservations/setting`
- `GET /v1/reservations/booked-times`
- `POST /v1/reservations`

### 관리자 기능

- `GET/POST/PATCH/DELETE /admin/faq`
- `GET/POST/PATCH/DELETE /admin/notice`
- `GET/POST/PATCH/DELETE /admin/terms`
- `GET/PATCH /admin/settings/studio`
- `GET/POST/DELETE /admin/settings/closed-days`
- `GET/POST/PATCH/DELETE /admin/settings/shooting-types`

## 실행 방법

### 1. 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

기본적으로 프론트 개발 서버는 Vite를 사용하며, `/api` 요청은 로컬 백엔드 `http://localhost:8080`으로 프록시됩니다.

### 3. 프로덕션 빌드

```bash
npm run build
```

### 4. 빌드 결과 미리보기

```bash
npm run preview
```

## 환경 변수

현재 코드 기준 API 기본값은 `/api`입니다.

지원하는 환경 변수:

```env
VITE_API_URL=/api
```

별도 백엔드 주소를 사용해야 한다면 루트 기준 `.env.local` 등에 `VITE_API_URL`을 지정해서 사용할 수 있습니다.

## 배포 주소

- 운영 프론트 URL: [https://studio-reservation-yeaygits-projects.vercel.app](https://studio-reservation-yeaygits-projects.vercel.app)

## 배포 메모

- 개발 환경: Vite proxy로 `/api` -> `http://localhost:8080`
- 배포 환경: Vercel rewrite로 `/api/*` -> Railway 백엔드
- SPA 라우팅 대응을 위해 나머지 경로는 모두 `/index.html`로 rewrite

## 디렉터리 구조

```text
src
├─ assets
├─ component
│  ├─ common
│  ├─ faq
│  ├─ layout
│  ├─ notice
│  ├─ reservation
│  ├─ setting
│  └─ terms
├─ constants
├─ pages
│  ├─ admin
│  ├─ auth
│  ├─ faq
│  ├─ notice
│  ├─ service
│  ├─ setting
│  └─ terms
├─ routes
├─ store
├─ styles
├─ types
└─ utils
```

