# 회원 관리 웹사이트 프로젝트 정의서

> 참고 저장소: https://github.com/janguk-Hwang/Member_Management
> 표시 규칙: **[확인]** = 저장소 코드에서 직접 확인, **[추정]** = 일부만 확인되어 합리적으로 보완한 내용

---

## 1. 프로젝트 개요
- **목적**: 회원 가입/로그인과 관리자 중심의 회원 조회·수정·삭제를 제공하는 웹 애플리케이션
- **형태**: React SPA(프론트) + Spring Boot REST API(백엔드), 단일 JAR/Docker 이미지로 통합 배포
- **사용자 역할**: `USER`(일반), `ADMIN`(관리자)

## 2. 기술 스택
| 영역 | 기술 |
|---|---|
| 백엔드 | Java 17, Spring Boot 4.1.x, Gradle, Spring Web, Spring Data JPA, Spring Security **[확인]** |
| 인증 | JWT (JwtTokenProvider / JwtAuthenticationFilter), BCrypt 비밀번호 해시, Stateless 세션 **[확인]** |
| DB | MySQL (로컬: `member_management_db`), 운영: TiDB Cloud(MySQL 호환) **[확인]** |
| 프론트 | React 19, Vite, react-router-dom, axios, date-fns, react-daum-postcode, oxlint **[확인]** |
| 배포 | Docker 멀티스테이지 빌드(ubuntu:22.04 + JDK17 + Node20 → eclipse-temurin:17-jre), `build.sh` **[확인]** |

## 3. 디렉터리 구조 **[확인]**
```
Member_Management/
├─ Dockerfile, .dockerignore, build.sh
├─ local_data_dump*.sql            # 로컬 데이터 덤프(샘플 데이터)
├─ backend/
│  ├─ build.gradle, settings.gradle, gradlew(.bat)
│  └─ src/main/
│     ├─ java/com/example/demo/
│     │  ├─ BackendApplication.java
│     │  ├─ config/       SecurityConfig, WebConfig
│     │  ├─ controller/   AuthController, MemberController, ReactRoutingController
│     │  ├─ dto/          AuthResponse, LoginRequest, SignupRequest
│     │  ├─ entity/       Member, Role
│     │  ├─ repository/   MemberRepository
│     │  ├─ security/     CustomUserDetails, CustomUserDetailsService,
│     │  │                JwtAuthenticationFilter, JwtTokenProvider
│     │  └─ service/      MemberService
│     └─ resources/       application.yml, application-prod.yml
└─ frontend/
   ├─ index.html, vite.config.js, package.json
   └─ src/
      ├─ main.jsx, App.jsx, App.css, index.css
      ├─ api/memberApi.js
      ├─ context/AuthContext.jsx
      └─ components/  Login, Signup, MemberList, MemberForm
```

## 4. 데이터 모델
### Member (테이블 `members`) **[확인]**
| 필드 | 타입 | 제약 |
|---|---|---|
| id | Long | PK, IDENTITY |
| name | String | NOT NULL, **UNIQUE** (로그인 아이디로 사용) |
| password | String | NOT NULL, BCrypt 해시 저장 |
| address | String | 선택 (다음 우편번호 API로 입력) |
| birthDate | LocalDate | 선택 |
| phone | String | NOT NULL |
| role | Enum(STRING) | NOT NULL, 기본 `USER` |
| (추가 컬럼) | | 엔티티 하단에 `@Column(len...` 형태의 필드 1개 이상 존재 — 세션 관리용 토큰/버전 필드로 **[추정]** (아래 5.3 참고) |

### Role: `USER`, `ADMIN` **[확인]**

## 5. 기능 요구사항
### 5.1 회원가입 (`Signup.jsx`) **[확인]**
- 입력: 아이디(name), 비밀번호, 비밀번호 확인, 주소, 생년월일(연/월/일 select), 전화번호, 역할(USER/ADMIN)
- **아이디 중복확인** 버튼: `GET /api/auth/check-name?name=` → 사용 가능 시 true. 중복확인 완료 전에는 가입 불가, 아이디 변경 시 확인 상태 초기화
- **주소 검색**: `react-daum-postcode` 모달, 도로명 주소일 때 법정동/건물명을 `(…)`로 덧붙임
- 비밀번호 일치 검사, 전화번호 입력 처리 **[추정: 숫자 하이픈 포맷팅]**
- 성공 시 로그인 페이지로 이동, 실패 시 오류 메시지 표시

### 5.2 로그인/로그아웃 **[확인]**
- `POST /api/auth/login` (name, password) → `AuthResponse`(JWT 토큰 및 사용자 정보)
- `AuthContext`에서 사용자 상태·`loading`·`logout` 관리, 토큰은 axios 헤더에 첨부 **[추정: localStorage 보관]**
- 헤더의 로그아웃 버튼 → 로그아웃 후 `/login` 이동

### 5.3 단일 기기 세션 **[확인(메시지) / 추정(구현)]**
- 401 응답 시 "세션이 만료되었거나 다른 기기에서 로그인되었습니다" 알림 후 강제 로그아웃
- 구현 방식(추정): 로그인 시 Member에 현재 토큰(또는 세션 식별자) 저장, 요청 시 JwtAuthenticationFilter가 저장값과 비교하여 불일치하면 401

### 5.4 회원 목록 (`MemberList.jsx`) **[확인]**
- `GET /api/members?name=&page=&size=10` — Spring `Pageable`, 응답은 `Page`(content, totalPages)
- 이름 검색: 입력 후 **300ms 디바운스**로 자동 조회, 페이지네이션(10건)
- 비로그인 시 접근 불가(`authentication == null` → 401)
- 권한별 동작 **[추정]**: ADMIN은 전체 회원 조회·수정·삭제, USER는 본인 정보만 조회/수정

### 5.5 회원 수정 모달 **[확인]**
- 수정 대상: 이름, 주소(우편번호 검색 포함), 생년월일, 전화번호
- 오버레이 mousedown/up 구분으로 드래그 중 모달이 닫히지 않도록 처리, 저장 중 상태(`saving`)
- `PUT /api/members/{id}` **[추정]**, `DELETE /api/members/{id}` **[추정]**

### 5.6 라우팅 **[확인]**
| 경로 | 화면 | 접근 |
|---|---|---|
| `/` | MemberList | 로그인 필요 |
| `/login` | Login | 공개 |
| `/signup` | Signup | 공개 |
- 헤더(로고 링크, 사용자 정보, 로그아웃)는 glass-panel 스타일
- `ReactRoutingController`가 비-API 경로를 `index.html`로 포워딩(SPA 새로고침 대응)

## 6. REST API 명세
| Method | URL | 설명 | 인증 |
|---|---|---|---|
| POST | /api/auth/signup | 회원가입 **[추정]** | 불필요 |
| POST | /api/auth/login | 로그인, JWT 발급 **[확인]** | 불필요 |
| GET | /api/auth/check-name?name= | 아이디 중복확인 (true=사용 가능) **[확인]** | 불필요 |
| GET | /api/members | 목록/검색/페이징 **[확인]** | 필요 |
| PUT | /api/members/{id} | 회원 수정 **[추정]** | 필요 |
| DELETE | /api/members/{id} | 회원 삭제 **[추정]** | ADMIN **[추정]** |

## 7. 보안 요구사항 **[확인]**
- Spring Security + `JwtAuthenticationFilter`, `SessionCreationPolicy.STATELESS`
- `BCryptPasswordEncoder`로 비밀번호 저장
- `/api/auth/**`, 정적 리소스, SPA 경로는 permitAll / 그 외 `/api/**`는 인증 **[추정]**
- `WebConfig`: CORS 설정 (개발 시 Vite 프록시 `/api` → 8080 **[추정]**)
- ⚠ **원본 저장소는 `application.yml`에 DB 비밀번호가 평문으로 커밋되어 있음.** 새 프로젝트에서는 반드시 환경변수(`${DB_PASSWORD}`, `${JWT_SECRET}`)로 분리할 것 (`application-prod.yml`은 이미 `${DB_PASSWORD}` 사용)

## 8. 환경 설정
**application.yml (로컬)**
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/member_management_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update        # [추정]
```
**application-prod.yml**: TiDB Cloud 접속(`useSSL=true`), 비밀번호는 `${DB_PASSWORD}`, `spring.profiles.active=prod`로 활성화 **[확인/추정]**

## 9. 빌드 및 배포
1. `build.sh`: `frontend`에서 `npm ci && npm run build` → 산출물(`dist`)을 `backend/src/main/resources/static`에 복사 → `./gradlew bootJar` **[추정]**
2. `Dockerfile`: 1단계 빌더(JDK17+Node20, `build.sh` 실행) → 2단계 `eclipse-temurin:17-jre-jammy`에서 JAR 실행 **[확인]**
3. 로컬 개발: 백엔드 `./gradlew bootRun`(8080), 프론트 `npm run dev`(Vite, `/api` 프록시)

## 10. UI/UX 가이드 **[확인/추정]**
- 글래스모피즘(glass-panel) 헤더·카드, `index.css`(~9KB)에 디자인 토큰 정의
- 로딩 시 "Loading…" 표시, 오류는 인라인 메시지, 중요 안내는 `alert`
- 한국어 UI (아이디, 비밀번호, 주소 등)

## 11. 구현 순서 (동일하게 재현하기 위한 로드맵)
1. Spring Initializr(Java 17, Gradle, Web/JPA/Security/MySQL) → `Member`, `Role`, `MemberRepository`
2. `JwtTokenProvider`, `JwtAuthenticationFilter`, `CustomUserDetails(Service)`, `SecurityConfig`, `WebConfig`
3. `MemberService`(가입·로그인·중복확인·조회·수정·삭제) → `AuthController`, `MemberController`
4. Vite + React 스캐폴딩, `AuthContext`, axios 설정, 라우팅
5. `Login` → `Signup`(다음 우편번호, 중복확인) → `MemberList`(검색·페이징·수정 모달)
6. `ReactRoutingController`로 SPA 포워딩, `build.sh`·`Dockerfile` 작성
7. 샘플 데이터(`local_data_dump.sql`) 적재 및 prod(TiDB) 프로필 검증

## 12. 인수 기준
- [ ] 중복확인 없이 가입 불가, 중복 아이디 거부
- [ ] 로그인 성공 시 목록 접근, 미로그인 시 `/login` 리다이렉트
- [ ] 이름 검색(300ms 디바운스)·10건 페이징 동작
- [ ] 수정 모달에서 주소 검색 후 저장 반영
- [ ] 다른 기기 로그인 시 기존 세션 401 + 안내 후 로그아웃
- [ ] 단일 Docker 이미지로 프론트+백엔드 동시 제공

## 13. 확인 한계
도구 출력 제한으로 `MemberController`/`MemberService`/`SecurityConfig`/`Login`/`MemberForm` 등의 후반부 코드는 일부만 확인했습니다. **[추정]** 항목은 원본 코드와 대조 후 보정이 필요합니다.
