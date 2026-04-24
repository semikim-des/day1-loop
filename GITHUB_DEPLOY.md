# 🚀 GitHub Pages 배포 가이드 (5분)

## ✅ 완전 무료 배포 방법

### 1️⃣ GitHub 계정 만들기 (이미 있으면 스킵)

https://github.com 접속 → Sign up → 계정 생성

---

## 2️⃣ 저장소 만들기 (Repository)

### **중요**: 저장소 이름이 `username.github.io` 여야 합니다!

**예시**:
- 당신의 깃헙 username이 `john123` 이면
- 저장소명: `john123.github.io`

### 단계별:

1. GitHub 로그인
2. 우측 상단 `+` 아이콘 → **New repository**
3. Repository name: **`yourusername.github.io`** (자신의 이름으로)
4. Public 선택 ✅
5. **Create repository** 클릭

---

## 3️⃣ 파일 업로드

### 방법 A: 웹에서 직접 업로드 (가장 쉬움)

1. 생성한 저장소 페이지 열기
2. **Add file** → **Upload files** 클릭
3. `index.html` 파일을 드래그 앤 드롭
4. **Commit changes** 클릭
5. 완료! ✅

### 방법 B: Git 명령어 사용

```bash
# 1. Git 설치 (이미 있으면 스킵)
# Mac: https://git-scm.com/download/mac
# Windows: https://git-scm.com/download/win

# 2. 프로젝트 폴더로 이동
cd /Users/semi_home/Documents/Claude/Projects/따릉이\ 포켓몬고

# 3. Git 초기화
git init

# 4. 파일 추가
git add index.html

# 5. 커밋
git commit -m "따릉몬 게임 초기 배포"

# 6. 원격 저장소 추가 (yourusername은 자신의 깃헙 username)
git remote add origin https://github.com/yourusername/yourusername.github.io.git

# 7. Push (처음에 username, password 입력)
git branch -M main
git push -u origin main
```

---

## 4️⃣ 배포 확인

약 **1~2분** 기다린 후 접속:

```
https://yourusername.github.io
```

✅ 앱이 떠야 합니다!

---

## 📱 모바일에서 테스트

### 친구의 휴대폰에서 테스트하기:

1. 당신의 배포 URL 공유: `https://yourusername.github.io`
2. 친구 휴대폰에서 접속
3. GPS 허용 클릭
4. 테스트 시작!

### QR 코드로 공유:

```bash
# QR 코드 생성 (아래 URL에 자신의 URL 입력)
https://qr-server.com/api/qrcode?size=300x300&data=https://yourusername.github.io
```

---

## 🔄 업데이트 하기 (나중에)

코드를 수정했을 때:

### 웹에서 업로드:
1. 저장소 들어가기
2. `index.html` 클릭
3. 연필 아이콘 (Edit) 클릭
4. 수정 후 **Commit changes**

### Git으로 업로드:
```bash
git add index.html
git commit -m "배그 수정"
git push
```

약 **30초~1분** 후 배포 반영됨

---

## 📊 배포 상태 확인

1. 저장소 > **Settings** 클릭
2. 좌측 **Pages** 클릭
3. "Your site is published at: https://..."

---

## ✨ 최종 체크리스트

- ✅ 저장소명이 `username.github.io`
- ✅ 저장소가 **Public**
- ✅ `index.html` 파일이 올라감
- ✅ 2분 기다림
- ✅ `https://username.github.io` 접속 가능
- ✅ GPS 허용
- ✅ 1km 범위 내에서 테스트

---

## 🎮 테스트 팁

### 반경이 1km인 이유:
- 실제 위치가 정확하지 않을 수 있음
- 친구들과 함께 테스트할 때 넓은 범위가 유용
- 나중에 50m으로 줄일 수 있음

### 배지 초기화하기:
브라우저 개발자도구 (F12) → Console 입력:
```javascript
localStorage.removeItem('badges');
location.reload();
```

---

## 💾 로컬 스토리지 주의

- 배지는 **각 휴대폰에만** 저장됨
- 친구 휴대폰에서 배지가 없어도 정상
- 캐시 삭제하면 배지 초기화됨

---

## 🆘 문제 해결

### "배포가 안 됨"
- [ ] 저장소명이 `username.github.io`인지 확인
- [ ] 저장소가 Public인지 확인
- [ ] 2~3분 더 기다리기
- [ ] 브라우저 캐시 삭제 (Ctrl+Shift+Delete)

### "GPS가 안 됨"
- [ ] 브라우저에서 위치 허용 권한 주기
- [ ] 스마트폰 GPS 켜져있는지 확인
- [ ] 실외에서 테스트
- [ ] WiFi 대신 모바일 데이터 사용

### "배지가 안 저장됨"
- [ ] Private 브라우저 모드 아닌지 확인
- [ ] localStorage 허용되어있는지 확인

---

## 📞 한눈에 정리

| 항목 | 내용 |
|-----|------|
| **비용** | 💚 완전 무료 |
| **도메인** | yourusername.github.io |
| **보안** | ✅ HTTPS 자동 |
| **배포 시간** | 1~2분 |
| **업데이트** | 30초 |
| **저장소** | Public |
| **데이터** | 각 휴대폰 로컬에만 저장 |

---

## 🎉 축하합니다!

이제 당신의 따릉몬 게임이 인터넷에 떠있습니다!
친구들과 함께 즐겨보세요! 🚴‍♂️🎮

---

**다음 단계** (선택):
- [ ] QR 코드로 친구들에게 공유
- [ ] 반경 조정 (50m → 1km 또는 반대)
- [ ] 거점 추가/변경
- [ ] UI 커스터마이징
