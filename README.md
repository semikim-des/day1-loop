# 따릉이 게임

서울 따릉이 대여소를 기반으로 가까운 대여소를 점령하고 랭킹을 겨루는 모바일 지도 게임입니다. 실제 GPS 위치, 공식 따릉이 대여소 데이터, Supabase 공용 저장소를 사용합니다.

## 참여자 입장 번호

아래 번호표를 문자로 공유합니다. 각자 이름 옆 4자리 번호를 입력하면 입장합니다.

| 이름 | 입장 번호 |
| --- | --- |
| 김세미 (👑) | 1001 |
| 김하영 | 1002 |
| 노수연 | 1003 |
| 이승연 | 1004 |
| 김성은 | 1005 |
| 이기쁨 | 1006 |
| 이수진 | 1007 |
| 장은서 | 1008 |
| 임다혜 | 1009 |
| 김송이 | 1010 |
| 황지예 | 1011 |

## 공유용 안내 멘트

```txt
따릉이 게임 입장 번호입니다.

김세미 (👑) 1001
김하영 1002
노수연 1003
이승연 1004
김성은 1005
이기쁨 1006
이수진 1007
장은서 1008
임다혜 1009
김송이 1010
황지예 1011

문자에서 자기 이름 옆 4자리 번호를 확인하고 앱에 입력하면 됩니다.
이름은 직접 변경할 수 없고, 120m 안의 따릉이 대여소만 점령할 수 있어요.
```

## 현재 기능

- 실제 GPS 기반 현재 위치 추적
- 공식 따릉이 대여소 데이터 표시
- 120m 안에서 대여소 점령
- 점령된 대여소의 소유자 표시
- 점령 수 기준 전체 랭킹
- 4자리 번호 기반 라이더 입장
- 닉네임 변경 비활성화
- Supabase `players`, `claims` 테이블 기반 공용 저장
- GitHub Pages 배포용 정적 사이트 구성

## 파일 구조

- `index.html`: 메인 앱
- `supabase-config.js`: 브라우저 공개용 Supabase 설정
- `supabase-config.example.js`: 설정 예시
- `supabase-reset.sql`: 참여자/점령 기록 초기화용 Supabase SQL
- `GITHUB_DEPLOY.md`: GitHub Pages 배포 확인 가이드

## 실행 방식

### 로컬 확인

`file://`로도 화면은 열리지만 GPS 권한, Supabase 연결, 공식 따릉이 데이터 fetch가 불안정할 수 있습니다. 가능하면 `localhost`나 GitHub Pages 같은 `https://` 환경에서 테스트하세요.

### GitHub Pages 배포

`main` 브랜치에 push하면 GitHub Pages 배포 워크플로우가 실행됩니다.

예상 배포 주소:

```txt
https://semikim-des.github.io/day1-loop/
```

처음 한 번은 저장소의 `Settings > Pages`에서 `Build and deployment`가 `GitHub Actions`로 잡혀 있는지 확인하면 안전합니다.

## Supabase 연결

현재 프로젝트는 아래 설정을 사용합니다.

- `SUPABASE_URL`: `https://eylirebdjrhnvvhrnhug.supabase.co`
- `SUPABASE_ANON_KEY`: `supabase-config.js`에 저장

`anon public` 키는 브라우저 공개용 키라 GitHub Pages에도 포함할 수 있습니다. `service_role` 키는 절대 클라이언트 파일에 넣으면 안 됩니다.

## Supabase 리셋

대시보드 SQL Editor에서 `supabase-reset.sql` 내용을 실행하면 아래 작업이 한 번에 처리됩니다.

- 기존 점령 기록 `claims` 삭제
- 기존 참여자 `players` 삭제
- 새 11명 번호 등록
- `players` 테이블의 공개 닉네임 변경 권한 차단

현재 앱의 공개 `anon` 키로는 RLS 때문에 `players` 등록/삭제와 `claims` 삭제가 막힐 수 있습니다. 운영 리셋은 Supabase SQL Editor에서 실행하는 방식이 가장 확실합니다.

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

1. 사용자가 공유받은 문자에서 자기 이름 옆 4자리 번호 확인
2. 번호 입력
3. `players` 테이블에서 코드 확인
4. 일치하면 지정된 이름으로 입장

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

- 번호표는 문자로 공유되므로 번호 자체는 비밀 인증 수단이 아니라 참여자 구분용입니다.
- `file://`에서는 Supabase와 외부 API 호출이 막힐 수 있습니다.
- 공식 따릉이 데이터는 환경에 따라 간헐적으로 응답이 끊길 수 있어 캐시 fallback이 들어가 있습니다.
- 닉네임은 앱에서 직접 변경할 수 없고, 변경이 필요하면 Supabase `players` 테이블에서 운영자가 수정합니다.
