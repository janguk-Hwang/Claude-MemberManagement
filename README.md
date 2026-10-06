# 회원 관리 웹사이트

Spring Boot(JWT) + React(Vite) 회원 관리 앱. 상세 요구사항은 [PROJECT_SPEC.md](PROJECT_SPEC.md) 참고.

## 사전 설치
- JDK 17, Node.js 20+ (MySQL은 선택: 기본은 H2 인메모리 DB)
- Gradle Wrapper 생성(최초 1회): `cd backend && gradle wrapper --gradle-version 8.10.2`

## 로컬 개발
```bash
# 1) 백엔드 (8080, H2)
cd backend && ./gradlew bootRun
#   MySQL 사용: DB_PASSWORD=... ./gradlew bootRun --args='--spring.profiles.active=mysql'

# 2) 프론트 (5173, /api 는 8080으로 프록시)
cd frontend && npm install && npm run dev
```
http://localhost:5173 접속 → 회원가입(ADMIN 선택 시 전체 관리) → 로그인.

## 배포: TiDB Cloud + Render
1. **TiDB Cloud**: 클러스터 생성 → Connect에서 호스트/포트(4000)/사용자(`접두사.root`)/비밀번호 확인.
   Render의 아웃바운드 접속이 허용되도록 IP 접근 목록을 `0.0.0.0/0`으로 설정(또는 Public 허용).
2. **GitHub에 push** 후 Render에서 *New → Blueprint*로 이 저장소 선택 (`render.yaml` 사용).
3. Render 환경변수 입력:

| 키 | 값 |
|---|---|
| `DB_URL` | `jdbc:mysql://<호스트>:4000/test?sslMode=VERIFY_IDENTITY&serverTimezone=UTC` |
| `DB_USERNAME` | `<접두사>.root` |
| `DB_PASSWORD` | TiDB 비밀번호 |
| `JWT_SECRET` | 자동 생성(재생성 시 모든 로그인 무효화) |

테이블(`members`)은 첫 기동 시 `ddl-auto: update`로 자동 생성됩니다.
무료 플랜은 유휴 시 슬립되어 첫 요청이 느립니다.

로컬에서 이미지 확인: `docker build -t member-management .`

## 권한 규칙
| 기능 | USER | ADMIN |
|---|---|---|
| 목록 조회 | 본인만 | 전체 + 이름 검색 + 페이징 |
| 수정 | 본인만 | 전체 |
| 삭제 | 불가 | 가능(본인 제외) |

단일 기기 세션: 새로 로그인하면 이전 토큰은 401이 되며 안내 후 자동 로그아웃됩니다.
