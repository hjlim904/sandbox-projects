# Sandbox Projects

Spring Boot 마이크로서비스 및 React(Vite) 기반의 실시간 시스템 모니터링 및 인증 샌드박스 프로젝트입니다.

---

## 📌 프로젝트 구조 및 주요 기능

```text
sandbox-projects/
├── backend/
│   ├── auth-service/        # 인증/인가 서비스 (Spring Boot MVC + Spring Security + JWT + H2)
│   └── reactive-service/    # 실시간 모니터링 서비스 (Spring Boot WebFlux + SSE + WebSocket)
└── frontend/
    └── frontend-react/      # React 클라이언트 (React 19 + Vite + Tailwind CSS + Recharts)
```

### 1. `auth-service` (Port: `8081`)
- **기술 스택**: Java 21, Spring Boot 4.1.0, Spring Security, Spring Data JPA, H2 Database, JWT
- **주요 기능**:
  - 회원가입 및 JWT 기반 로그인 인증 (`/api/auth/login`, `/api/auth/signup`)
  - H2 인메모리 DB 및 콘솔 지원 (`/h2-console`)
  - 애플리케이션 실행 시 기본 테스트 계정 자동 생성 (`DataInitializer`)

### 2. `reactive-service` (Port: `8082`)
- **기술 스택**: Java 21, Spring Boot 4.1.0 (WebFlux), Spring Security, SSE(Server-Sent Events), WebSocket, Actuator
- **주요 기능**:
  - **SSE 실시간 시스템 메트릭 스트리밍**: CPU, Memory, Thread 사용량 실시간 전송 (`/api/dashboard/metrics/stream`)
  - **WebSocket 헬스체크**: 외부 및 내부 컴포넌트 상태 실시간 모니터링 (`/ws/health`)
  - Hexagonal Architecture (Port & Adapter) 패턴 적용

### 3. `frontend-react` (Port: `5173`)
- **기술 스택**: React 19, Vite, TypeScript, Tailwind CSS v4, Recharts, Lucide React
- **주요 기능**:
  - JWT 인증 상태 관리 (`AuthContext`) 및 보호된 라우트 (`ProtectedRoute`)
  - 대시보드 메트릭 시각화 (CPU, 메모리, 스레드 실시간 차트 및 헬스체크 위젯)
  - SSE 및 WebSocket 연동 커스텀 훅 (`useSseMetric`, `useWebSocketHealth`)

---

## 🚀 실행 방법

### 사전 요구사항 (Prerequisites)
- **Java**: JDK 21 이상
- **Node.js**: Node 18+ 및 npm

---

### 1. 백엔드 서비스 실행

각 서비스 디렉토리로 이동하여 Gradle Wrapper로 실행합니다.

#### 1) Auth Service 실행 (Port 8081)
```bash
cd backend/auth-service
./gradlew bootRun
```
> Windows 환경: `.\gradlew.bat bootRun`

#### 2) Reactive Service 실행 (Port 8082)
```bash
cd backend/reactive-service
./gradlew bootRun
```
> Windows 환경: `.\gradlew.bat bootRun`

---

### 2. 프론트엔드 실행 (Port 5173)

```bash
cd frontend/frontend-react
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속합니다.

---

## 🔑 기본 테스트 계정

`auth-service` 구동 시 초기 데이터로 자동 생성되는 테스트 계정입니다:

| 아이디 (username) | 비밀번호 (password) | 이름 | 역할 |
| :--- | :--- | :--- | :--- |
| `admin` | `1` | 관리자 | Admin |
| `user1` | `1` | 일반유저 | User |

---

## 🛠 주요 엔드포인트

- **Auth Service**: `http://localhost:8081`
  - H2 Console: `http://localhost:8081/h2-console` (JDBC URL: `jdbc:h2:mem:authdb`, User: `sa`, Password: 빈값)
  - Auth API: `POST /api/auth/login`, `POST /api/auth/signup`
- **Reactive Service**: `http://localhost:8082`
  - SSE 메트릭 스트림: `GET /api/dashboard/metrics/stream`
  - WebSocket 헬스체크: `ws://localhost:8082/ws/health`
- **Frontend Web**: `http://localhost:5173`