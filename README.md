# Sandbox Projects

Spring Boot 마이크로서비스 및 React(Vite) 기반의 실시간 시스템 모니터링 및 인증 샌드박스 프로젝트입니다.

---

## 📌 프로젝트 구조

```text
sandbox-projects/
├── backend/
│   ├── auth-service/        # 인증/인가 서비스 (Spring Boot MVC + Spring Security + JWT + H2)
│   ├── reactive-service/    # 비동기 반응형 & AI 서비스 (Spring Boot WebFlux + R2DBC + SSE + WebSocket + Gemini AI)
│   ├── discovery-service/   # 서비스 등록/디스커버리 (Spring Cloud Eureka Server, Port 8761)
│   └── gateway-service/     # API 단일 진입점 (Spring Cloud Gateway WebFlux, Port 8080)
└── frontend/
    └── frontend-react/      # 프론트엔드 클라이언트 (React 19 + Vite + TypeScript + Tailwind CSS v4 + Recharts + i18next)
```

---

## 🛠 서비스별 상세 스택 및 구현 현황

### 1. `auth-service` (Port: `8081`)
* **기술 스택**: Java 21, Spring Boot, Spring MVC, Spring Data JPA, Spring Security, JWT, H2 Database, Spring Cloud Eureka Client
* **주요 기능**:
  * 회원가입 및 JWT 기반 로그인 인증 (`/api/auth/signup`, `/api/auth/login`)
  * JWT Access Token (10분) + Refresh Token (1시간) 발급 및 RTR(Refresh Token Rotation) 기반 갱신 (`/api/auth/refresh`)
  * JWT 토큰 페이로드에 `role` (ADMIN / USER) 클레임 발급
  * 애플리케이션 기동 시 테스트 계정(`admin`, `user1`) 자동 초기화 (`DataInitializer`)
  * H2 인메모리 콘솔 지원 (`/h2-console`)
  * Eureka Server 자동 등록 (`AUTH-SERVICE`)

### 2. `reactive-service` (Port: `8082`)
* **기술 스택**: Java 21, Spring Boot (WebFlux), Netty, R2DBC (H2), Spring Security (Reactive Resource Server), Spring AI (OpenAI/Gemini 호환 Starter), Actuator, Spring Cloud Eureka Client
* **아키텍처**: 헥사고날 아키텍처 (Domain Model ➡️ In/Outbound Port ➡️ Service ➡️ In/Outbound Adapter)
* **개발 방식**: 엄격한 TDD (`StepVerifier`, `WebTestClient` 기반 단위/통합 테스트 100% 검증)
* **주요 기능**:
  * **[실습 1] R2DBC 비동기 게시판 & 댓글 CRUD**:
    * 완전 논블로킹 R2DBC 기반 게시글/댓글 CRUD 및 페이징 조회 (`GET /api/posts?page=0&size=10`)
    * `Mono.zip`을 활용한 게시글 상세 + 댓글 목록 병렬 조회 (`GET /api/posts/{id}`)
    * 트랜잭션 보장 게시글-댓글 연쇄 삭제 (`DELETE /api/posts/{id}`)
  * **[실습 2] JWT RBAC & Reactive Security**:
    * JWT 리액티브 토큰 검증 필터 (`JwtAuthenticationConverter`, `JwtReactiveAuthenticationManager`)
    * 엔드포인트 권한 분기: Public, USER 전용 (`/api/security/user-only`), ADMIN 전용 (`/api/security/admin-only`)
    * 인가 실패 시 리액티브 403 Forbidden 및 에러 응답
  * **[실습 3] 실시간 백엔드 상태 대시보드**:
    * **SSE 단방향 지표 스트리밍**: 1초 주기 CPU, JVM Heap 메모리, 스레드 지표 실시간 푸시 (`/api/dashboard/stream/{cpu, memory, threads}`)
    * **WebSocket 양방향 헬스 진단**: R2DBC DB 및 Auth-Service 실시간 상태 푸시 & 클라이언트 즉시 진단 요청 (`/ws/dashboard/health`)
  * **[실습 4] AI Ops 시스템 진단 에이전트 (Spring AI 2.0.1)**:
    * Spring AI `ChatClient` + `@Tool` 표준 컴포넌트 (`SystemOpsTools`)
    * Google Gemini 3.7 Flash (Low Thinking budget: 1024) OpenAI 호환 엔드포인트 연동
    * **등록된 Tools**: `get_system_metrics` (CPU/메모리/스레드 조회), `check_component_health` (DB/Auth 상태 진단), `search_board_posts` (R2DBC 게시판 키워드 검색)
    * 실시간 SSE 이벤트 스트리밍 (`POST /api/agent/chat/stream`)
  * Eureka Server 자동 등록 (`REACTIVE-SERVICE`)

### 3. `discovery-service` (Port: `8761`)
* **기술 스택**: Java 21, Spring Boot, Spring Cloud Netflix Eureka Server
* **주요 기능**:
  * `@EnableEurekaServer` 기반 서비스 레지스트리
  * `auth-service`, `reactive-service`, `gateway-service` 자동 등록 및 헬스체크
  * 대시보드: `http://localhost:8761` (등록된 인스턴스 모니터링)
  * Scale-out 시 다중 인스턴스 자동 인식 (`instance-id: ${spring.application.name}:${random.value}`)

### 4. `gateway-service` (Port: `8080`)
* **기술 스택**: Java 21, Spring Boot, Spring Cloud Gateway Server WebFlux (Netty), Spring Cloud Eureka Client
* **주요 기능**:
  * 프론트엔드 **단일 진입점** (`http://localhost:8080`) — 8081/8082 포트 직접 호출 제거
  * Eureka 연동 동적 로드밸런싱 (`lb://auth-service`, `lb://reactive-service`)
  * 글로벌 CORS 일괄 처리 (`http://localhost:5173` 허용, 각 서비스 CORS 설정 제거)
  * **라우팅 규칙**:
    * `/api/auth/**` → `lb://auth-service`
    * `/ws/**` → `lb://reactive-service` (WebSocket)
    * `/api/**` → `lb://reactive-service` (REST + SSE)

### 5. `frontend-react` (Port: `5173`)
* **기술 스택**: React 19, Vite, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons, i18next, react-i18next
* **주요 기능**:
  * **다국어 지원 (i18n)**: 한국어 / 영어 실시간 전환, 우측 상단 언어 토글 (`LanguageToggle.tsx`)
  * JWT Access Token 만료 시 Refresh Token으로 자동 세션 연장 (Silent Refresh, 중복 요청 방지 뮤텍스 패턴)
  * JWT 토큰 만료 검증 및 전역 인증 관리 (`AuthContext`), 비로그인 차단 (`ProtectedRoute`)
  * 4개 실습 코스 네비게이션 및 카드 레이아웃 대시보드 (`MainPage.tsx`)
  * **[실습 1] R2DBC 게시판 UI (`Practice1Page.tsx`)**: 게시글 목록/페이징, 상세 모달, 댓글 작성/삭제
  * **[실습 2] JWT RBAC 인가 테스트 UI (`Practice2Page.tsx`)**: 토큰 상태, 롤별(USER/ADMIN) 인가 API 호출 및 200 OK / 403 Forbidden 상태 시각화
  * **[실습 3] 상태 대시보드 (`Practice3Page.tsx`)**: Recharts 실시간 Area Chart (CPU %, JVM Heap MB), WebSocket 헬스 배지, 인터랙티브 진단 콘솔 터미널
  * **[실습 4] AI 콘솔 (`Practice4Page.tsx`)**: Tool 실행 시각화 배지, 실시간 마크다운 스트리밍, 시스템/게시판 원클릭 질문 프리셋
  * API 호출 단일 진입점 변경: 모든 요청 `http://localhost:8080` (Gateway) 경유

---

## 🚦 실습 구현 상태 및 로드맵

| 실습 번호 | 주제 | 백엔드 구현 | 프론트엔드 구현 | 상태 |
| :--- | :--- | :---: | :---: | :---: |
| **실습 1** | R2DBC 비동기 API 게시판 (CRUD & 페이징 & 댓글) | ✅ 완료 | ✅ 완료 | 🟢 완료 |
| **실습 2** | JWT RBAC & Reactive Security 권한 제어 | ✅ 완료 | ✅ 완료 | 🟢 완료 |
| **실습 3** | 실시간 시스템 메트릭 대시보드 (SSE & WebSocket) | ✅ 완료 | ✅ 완료 | 🟢 완료 |
| **실습 4** | AI Ops 시스템 진단 에이전트 (Spring AI 2.0.1 + Gemini 3.7 Flash) | ✅ 완료 | ✅ 완료 | 🟢 완료 |
| **추가 1** | JWT Silent Refresh (RTR 패턴, 뮤텍스 중복 방지) | ✅ 완료 | ✅ 완료 | 🟢 완료 |
| **추가 2** | 프론트엔드 다국어(i18n) KR/EN 토글 | - | ✅ 완료 | 🟢 완료 |
| **추가 3** | Service Discovery & Scale-out (Eureka) | ✅ 완료 | - | 🟢 완료 |
| **추가 4** | API Gateway 단일 진입점 (Spring Cloud Gateway) | ✅ 완료 | ✅ 완료 | 🟢 완료 |

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

### 1. 백엔드 서비스 실행 (기동 순서 중요)

> **⚠️ 반드시 아래 순서대로 기동하세요.**
> Discovery Service가 먼저 올라와야 나머지 서비스가 Eureka에 정상 등록됩니다.

#### 1) Discovery Service 실행 (Port 8761) — 최우선 기동
```bash
cd backend/discovery-service
./gradlew bootRun
```
기동 후 `http://localhost:8761` 에서 Eureka 대시보드 확인

#### 2) Auth Service 실행 (Port 8081)
```bash
cd backend/auth-service
./gradlew bootRun
```

#### 3) Reactive Service 실행 (Port 8082)
```bash
cd backend/reactive-service
export GEMINI_API_KEY="your-gemini-api-key"
./gradlew bootRun
```

#### 4) Gateway Service 실행 (Port 8080) — 마지막 기동
```bash
cd backend/gateway-service
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
| `admin` | `1` | 관리자 | ROLE_ADMIN |
| `user1` | `1` | 일반유저 | ROLE_USER |

---

## 🛠 주요 API & 엔드포인트

> **API Gateway 적용 이후**: 프론트엔드는 모든 API를 `http://localhost:8080` (Gateway)를 통해 호출합니다.
> 아래 직접 호출 주소는 서비스 직접 접근 또는 디버깅 용도로만 사용합니다.

### Gateway (`http://localhost:8080`) — 프론트엔드 단일 진입점
* **인증**: `POST /api/auth/login`, `POST /api/auth/signup`, `POST /api/auth/refresh`
* **게시판**: `GET|POST|PUT|DELETE /api/posts/**`, `POST|DELETE /api/posts/{id}/comments/**`
* **보안 검증**: `GET /api/security/public|user-only|admin-only`
* **SSE 메트릭**: `GET /api/dashboard/stream/cpu|memory|threads`
* **WebSocket 헬스**: `ws://localhost:8080/ws/dashboard/health`
* **AI Agent**: `POST /api/agent/chat/stream`

### Discovery Service (`http://localhost:8761`)
* **Eureka 대시보드**: `http://localhost:8761` (등록된 서비스 인스턴스 모니터링)

### Auth Service 직접 (`http://localhost:8081`)
* **로그인**: `POST /api/auth/login`
* **토큰 갱신**: `POST /api/auth/refresh`
* **H2 Console**: `http://localhost:8081/h2-console` (`jdbc:h2:mem:authdb`, User: `sa`, Password: 빈값)

### Reactive Service 직접 (`http://localhost:8082`)
* **게시판 & 댓글 (R2DBC)**:
  * `GET /api/posts?page=0&size=10` (게시글 페이징 목록)
  * `GET /api/posts/{id}` (게시글 상세 + 댓글 목록)
  * `POST /api/posts` (게시글 생성)
  * `PUT /api/posts/{id}` (게시글 수정)
  * `DELETE /api/posts/{id}` (게시글 삭제)
  * `POST /api/posts/{id}/comments` (댓글 생성)
  * `DELETE /api/posts/comments/{commentId}` (댓글 삭제)
* **RBAC 보안 검증**:
  * `GET /api/security/public` (공개 엔드포인트)
  * `GET /api/security/user-only` (ROLE_USER, ROLE_ADMIN 접근 가능)
  * `GET /api/security/admin-only` (ROLE_ADMIN 전용)
* **SSE 메트릭 스트림**:
  * `GET /api/dashboard/stream/cpu` (CPU 사용률 %)
  * `GET /api/dashboard/stream/memory` (JVM Heap 사용량 MB)
  * `GET /api/dashboard/stream/threads` (활성 스레드 수)
* **WebSocket 실시간 헬스**: `ws://localhost:8082/ws/dashboard/health`
* **AI Ops Agent 스트림**: `POST /api/agent/chat/stream`