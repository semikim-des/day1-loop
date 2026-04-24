#!/bin/bash

# 따릉몬 GitHub Pages 자동 배포 스크립트
# 사용법: bash deploy.sh

echo "🚀 따릉몬 배포 시작!"
echo "================================"

# 설정
read -p "GitHub username 입력: " USERNAME
REPO="${USERNAME}.github.io"

# Git 초기화 확인
if [ ! -d ".git" ]; then
    echo ""
    echo "📝 Git 저장소 초기화 중..."
    git init
fi

# 원격 저장소 설정 확인
if ! git remote | grep -q origin; then
    echo ""
    echo "🔗 원격 저장소 추가 중..."
    git remote add origin "https://github.com/${USERNAME}/${REPO}.git"
fi

# 파일 추가
echo ""
echo "📁 파일 추가 중..."
git add index.html

# 커밋
echo "💾 커밋 중..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "따릉몬 배포: ${TIMESTAMP}" || echo "⚠️  변경사항 없음 (이미 최신)"

# Push
echo ""
echo "📤 푸시 중..."
git branch -M main
git push -u origin main

echo ""
echo "✅ 배포 완료!"
echo "================================"
echo "📱 앱 접속: https://${USERNAME}.github.io"
echo ""
echo "💡 팁:"
echo "  - 1~2분 기다린 후 접속하세요"
echo "  - GPS 권한을 허용해야 합니다"
echo "  - 강남구 반경 1km 범위에서 배틀이 시작됩니다"
echo ""
