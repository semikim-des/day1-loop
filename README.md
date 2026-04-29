# 따릉이 게임

서울 따릉이 대여소를 기반으로 대여소를 점령하고 랭킹을 겨루는 모바일 지도 게임입니다. 실제 GPS 위치, 공식 따릉이 대여소 데이터, Supabase 공용 저장소를 사용합니다.

## 현재 기능

- 실제 GPS 기반 현재 위치 추적
- 공식 따릉이 대여소 데이터 표시
- 120m 안에서 대여소 점령
- 점령된 대여소의 소유자 표시
- 점령 수 기준 전체 랭킹
- 고유번호 기반 라이더 입장
- 닉네임 변경
- Supabase `players`, `claims` 테이블 기반 공용 저장
- GitHub Pages 배포용 정적 사이트 구성

## 파일 구조

- [index.html](/Users/semi_home/Documents/Claude/Projects/따릉이%20포켓몬고/index.html): 메인 앱
- [supabase-config.js](/Users/semi_home/Documents/Claude/Projects/따릉이%20포켓몬고/supabase-config.js): 브라우저 공개용 Supabase 설정
- [supabase-config.example.js](/Users/semi_home/Documents/Claude/Projects/따릉이%20포켓몬고/supabase-config.example.js): 설정 예시
- [.github/workflows/deploy-pages.yml](/Users/semi_home/Documents/Claude/Projects/따릉이%20포켓몬고/.github/workflows/deploy-pages.yml): GitHub Pages 배포 워크플로우
- [GITHUB_DEPLOY.md](/Users/semi_home/Documents/Claude/Projects/따릉이%20포켓몬고/GITHUB_DEPLOY.md): 배포 확인 가이드

## 실행 방식

### 1. 로컬 확인

`file://`로도 화면은 열리지만 아래 항목은 불안정할 수 있습니다.

- GPS 권한
- Supabase 연결
- 공식 따릉이 데이터 fetch

가능하면 `localhost`나 GitHub Pages 같은 `https://` 환경에서 테스트하는 것을 권장합니다.

### 2. GitHub Pages 배포

이 저장소는 GitHub Actions로 정적 배포되도록 설정되어 있습니다. `main` 브랜치에 push되면 Pages 배포 워크플로우가 실행됩니다.

예상 배포 주소:

```txt
https://semikim-des.github.io/day1-loop/
```

처음 한 번은 저장소의 `Settings > Pages`에서 `Build and deployment`가 `GitHub Actions`로 잡혀 있는지 확인하면 안전합니다.

## Supabase 연결

현재 프로젝트는 아래 설정을 사용합니다.

- `SUPABASE_URL`: `https://eylirebdjrhnvvhrnhug.supabase.co`
- `SUPABASE_ANON_KEY`: [supabase-config.js](/Users/semi_home/Documents/Claude/Projects/따릉이%20포켓몬고/supabase-config.js)에 저장

`anon public` 키는 브라우저 공개용 키라 GitHub Pages에도 포함할 수 있습니다. `service_role` 키는 절대 넣으면 안 됩니다.

## Supabase 테이블

### players

- `code` text primary key
- `nickname` text not null
- `avatar` text
- `created_at` timestamptz default now()

### claims

- `station_id` text primary key
- `station_name` text not null
- `lat` double precision
- `lng` double precision
- `owner_code` text references `players(code)`
- `claimed_at` timestamptz default now()

## 데이터 흐름

### 입장

1. 사용자가 고유번호 입력
2. `players` 테이블에서 코드 확인
3. 일치하면 해당 닉네임으로 세션 시작

### 점령

1. 현재 위치 기준 가장 가까운 대여소 탐색
2. 120m 안이면 점령 버튼 노출
3. 점령 시 `claims` 테이블에 저장
4. 다른 접속자는 Realtime 구독으로 변경 반영

### 랭킹

1. `claims`를 `owner_code` 기준으로 집계
2. 많이 점령한 순으로 정렬
3. 같은 데이터가 모든 접속자에게 보임

## 주의사항

- `file://`에서는 Supabase와 외부 API 호출이 막힐 수 있습니다.
- 공식 따릉이 데이터는 환경에 따라 간헐적으로 응답이 끊길 수 있어 캐시 fallback이 들어가 있습니다.
- 현재 RLS 정책은 테스트용으로 넓게 열려 있으니, 서비스 오픈 전에는 코드별 제한 정책으로 강화하는 것이 좋습니다.

## 다음 개선 후보

- 점령 정책을 Edge Function으로 이동
- 주간 랭킹 리셋
- 프로필 아바타 커스터마이징
- 대여소 점령 이력 페이지
- 주간 왕관 효과와 보상 시스템
