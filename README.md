# Sandbox Projects

Spring Boot 마이크로서비스 및 React(Vite) 기반의 실시간 시스템 모니터링 및 인증 샌드박스 프로젝트입니다.

---

## 📌 프로젝트 구조

```text
sandbox-projects/
├── backend/
│   ├── auth-service/        # 인증/인가 서비스 (Spring Boot MVC + Spring Security + JWT + H2)
│   └── reactive-service/    # 비동기 반응형 & AI 서비스 (Spring Boot WebFlux + R2DBC + SSE + WebSocket + Gemini AI)
└── frontend/
    └── frontend-react/      # 프론트엔드 클라이언트 (React 19 + Vite + TypeScript + Tailwind CSS v4 + Recharts)
```

---

## 🛠 서비스별 상세 스택 및 구현 현황

### 1. `auth-service` (Port: `8081`)
* **기술 스택**: Java 21, Spring Boot, Spring MVC, Spring Data JPA, Spring Security, JWT (HMAC-SHA256), H2 Database
* **주요 기능**:
  * 회원가입 및 JWT 기반 로그인 인증 (`/api/auth/signup`, `/api/auth/login`)
  * 애플리케이션 기동 시 테스트 계정(`admin`, `user1`) 자동 초기화 (`DataInitializer`)
  * H2 인메모리 콘솔 지원 (`/h2-console`)

### 2. `reactive-service` (Port: `8082`)
* **기술 스택**: Java 21, Spring Boot (WebFlux), Netty, R2DBC (H2), Spring Security (Reactive), Actuator, Gemini REST API
* **아키텍처**: 헥사고날 아키텍처 (Domain Model ➡️ In/Outbound Port ➡️ Service ➡️ In/Outbound Adapter)
* **개발 방식**: 엄격한 TDD (`StepVerifier`, `WebTestClient` 기반 단위/통합 테스트 100% 검증)
* **주요 기능**:
  * **[실습 3] 실시간 백엔드 상태 대시보드**:
    * **SSE 단방향 지표 스트리밍**: 1초 주기 CPU, JVM Heap 메모리, 스레드 지표 실시간 푸시 (`/api/dashboard/stream/{cpu, memory, threads}`)
    * **WebSocket 양방향 헬스 진단**: R2DBC DB 및 Auth-Service 실시간 상태 푸시 & 클라이언트 즉시 진단 요청 (`/ws/dashboard/health`)
  * **[실습 4] AI Ops 시스템 진단 에이전트 (1차 구현)**:
    * Google Gemini Flash API + Function Calling (Tool Use) + SSE 실시간 스트리밍 (`POST /api/agent/chat/stream`)
    * **등록된 Tools**: `get_system_metrics` (CPU/메모리/스레드 조회), `check_component_health` (DB/Auth 상태 진단)
    * `THINKING` ➡️ `TOOL_CALL` ➡️ `TEXT_CHUNK` ➡️ `DONE` 단계별 실시간 이벤트 스트리밍

### 3. `frontend-react` (Port: `5173`)
* **기술 스택**: React 19, Vite, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons
* **주요 기능**:
  * JWT 토큰 만료 검증 및 전역 인증 관리 (`AuthContext`), 비로그인 차단 (`ProtectedRoute`)
  * 4개 실습 코스 네비게이션 및 카드 레이아웃 대시보드 (`MainPage.tsx`)
  * **[실습 3] 상태 대시보드 (`Practice3Page.tsx`)**: Recharts 실시간 Area Chart (CPU %, JVM Heap MB), WebSocket 헬스 배지, 인터랙티브 진단 콘솔 터미널
  * **[실습 4] AI Ops 콘솔 (`Practice4Page.tsx`)**: Tool 실행 시각화 배지, 실시간 마크다운 스트리밍, 원클릭 질문 프리셋

---

## 🚦 실습 구현 상태 및 로드맵

| 실습 번호 | 주제 | 백엔드 구현 | 프론트엔드 구현 | 상태 |
| :--- | :--- | :---: | :---: | :---: |
| **실습 1** | R2DBC 비동기 API 게시판 (CRUD & 페이징) | 예정 | 예정 | 🎯 대기 중 |
| **실습 2** | JWT RBAC & Reactive Security 권한 제어 | 예정 | 예정 | 🎯 대기 중 |
| **실습 3** | 실시간 시스템 메트릭 대시보드 (SSE & WebSocket) | ✅ 완료 | ✅ 완료 | 🟢 완료 |
| **실습 4** | AI Ops 시스템 진단 에이전트 (Gemini Tool Use) | ✅ 완료 (1차) | ✅ 완료 | 🟡 변경 예정 (Spring AI 적용) |

---

## 🚀 실행 방법

### 사전 요구사항 (Prerequisites)
* **Java**: JDK 21 이상
* **Node.js**: Node 18+ 및 npm
* **Gemini API Key** (실습 4 에이전트 구동 시 필요):
  ```bash
  export GEMINI_API_KEY="your-gemini-api-key"
  ```

---

### 1. 백엔드 서비스 실행

#### 1) Auth Service 실행 (Port 8081)
```bash
cd backend/auth-service
./gradlew bootRun
```

#### 2) Reactive Service 실행 (Port 8082)
```bash
cd backend/reactive-service
# Gemini API Key 설정 (application.yml 환경변수 주입)
export GEMINI_API_KEY="your-api-key"
./gradlew bootRun
```

---

### 2. 프론트엔드 실행 (Port 5173)

```bash
cd frontend/frontend-react
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 에 접속합니다.

---

## 🔑 기본 테스트 계정

`auth-service` 구동 시 초기 데이터로 자동 생성되는 테스트 계정입니다:

| 아이디 (username) | 비밀번호 (password) | 이름 | 역할 |
| :--- | :--- | :--- | :--- |
| `admin` | `1` | 관리자 | Admin |
| `user1` | `1` | 일반유저 | User |

---

## 🛠 주요 API & 엔드포인트

### 1. Auth Service (`http://localhost:8081`)
* **로그인**: `POST /api/auth/login`
* **회원가입**: `POST /api/auth/signup`
* **H2 Console**: `http://localhost:8081/h2-console` (`jdbc:h2:mem:authdb`, User: `sa`, Password: 빈값)

### 2. Reactive Service (`http://localhost:8082`)
* **SSE 메트릭 스트림**:
  * `GET /api/dashboard/stream/cpu` (CPU 사용률 %)
  * `GET /api/dashboard/stream/memory` (JVM Heap 사용량 MB)
  * `GET /api/dashboard/stream/threads` (활성 스레드 수)
* **WebSocket 실시간 헬스**: `ws://localhost:8082/ws/dashboard/health`
* **AI Ops Agent 스트림**: `POST /api/agent/chat/stream`