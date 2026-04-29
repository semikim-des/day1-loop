# GitHub Pages 배포 가이드

현재 이 프로젝트는 GitHub Actions 기반 GitHub Pages 배포 구성이 들어가 있습니다.

## 배포 방식

1. `main` 브랜치에 push
2. GitHub Actions가 정적 파일 업로드
3. GitHub Pages로 배포

예상 주소:

```txt
https://semikim-des.github.io/day1-loop/
```

## 처음 한 번 확인할 것

1. GitHub 저장소 열기
2. `Settings > Pages`
3. `Build and deployment`가 `GitHub Actions`로 잡혀 있는지 확인

## 현재 배포에 포함되는 파일

- `index.html`
- `supabase-config.js`
- 정적 문서 파일들

## 왜 `supabase-config.js`를 포함하나

이 프로젝트는 브라우저에서 Supabase `anon public` 키를 사용합니다. 이 키는 공개용이므로 GitHub Pages에 포함해도 됩니다.

절대 포함하면 안 되는 키:

- `service_role`

## 배포 후 체크리스트

1. 페이지가 열리는지
2. GPS 권한 요청이 뜨는지
3. 고유번호로 입장되는지
4. 랭킹이 보이는지
5. 대여소 점령 후 다른 기기에서도 반영되는지

## 흔한 문제

### 배포는 됐는데 Supabase가 안 붙음

- `supabase-config.js`가 최신인지 확인
- `anon public` 키가 들어있는지 확인
- RLS 정책이 생성되어 있는지 확인

### GitHub Pages는 뜨는데 GPS가 이상함

- 모바일 브라우저에서 위치 권한 허용
- `https://` 주소에서 테스트
- 데스크탑보다 모바일 실기기에서 확인

### 점령이 저장되지 않음

- `claims` 정책이 만들어졌는지 확인
- 같은 대여소가 이미 저장되어 primary key 충돌이 난 건 아닌지 확인
