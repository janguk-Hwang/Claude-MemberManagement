#!/usr/bin/env bash
# React 빌드 결과를 Spring Boot static 폴더에 넣고 단일 JAR로 패키징
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

cd "$ROOT/frontend"
npm ci || npm install
npm run build

rm -rf "$ROOT/backend/src/main/resources/static"
mkdir -p "$ROOT/backend/src/main/resources/static"
cp -r dist/* "$ROOT/backend/src/main/resources/static/"

cd "$ROOT/backend"
chmod +x gradlew
./gradlew bootJar -x test
