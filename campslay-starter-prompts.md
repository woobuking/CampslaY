# CampslaY — VS Code 스타터 프롬프트 모음

---

## STEP 0 — 폴더 생성 & GitHub 초기 세팅

터미널에서 순서대로 실행:

```bash
# 1. 프로젝트 폴더 생성
mkdir campslay && cd campslay

# 2. Git 초기화
git init

# 3. GitHub에서 레포 생성 후 (campslay 이름으로):
git remote add origin https://github.com/[YOUR_USERNAME]/campslay.git

# 4. Vite + React 프로젝트 생성
npm create vite@latest . -- --template react

# 5. 의존성 설치
npm install

# 6. Tailwind CSS 설치
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 7. CLAUDE.md와 items.json을 프로젝트에 복사 (이미 다운로드한 파일들)
# CLAUDE.md → 프로젝트 루트
# items.json → src/data/items.json
mkdir -p src/data

# 8. .gitignore 확인 후 첫 커밋
git add .
git commit -m "feat: initial project setup - Vite + React + Tailwind"
git push -u origin main

# 9. develop 브랜치 생성
git checkout -b develop
git push -u origin develop
```

---

## STEP 1 — Claude Code 첫 번째 프롬프트

```
/writing-plans

CampslaY 프로젝트를 시작합니다.
CLAUDE.md를 먼저 읽고 전체 컨텍스트를 파악한 뒤,
아래 순서로 MVP 구현 계획서를 작성해줘.

### 목표
5개 입력값을 받아 아이템 리스트 + Model Y 적재 도식 + 요리 추천을
출력하는 React 웹앱 MVP 완성.

### 계획서에 포함할 내용

1. **데이터 검증**
   - src/data/items.json 구조가 필터링 로직에 적합한지 확인
   - 수정 필요한 부분 있으면 명시

2. **컴포넌트 설계**
   - InputPanel: 5개 입력값 (tent, nights, season, heater, igt, people)
   - PackingResult: 카테고리별 체크리스트
   - CarVisualizer: Model Y Juniper SVG (공간별 아이템 표시)
   - RecipeResult: 계절/인원 기반 요리 추천 3~5가지

3. **Model Y SVG 설계 방향**
   - 2025 Juniper 측면도 또는 상단 조감도 중 어느 쪽이 적재 표현에 적합한지
   - frunk / trunk_main / trunk_side / trunk_under / rear_seat 5공간 표현 방법

4. **필터링 로직 설계**
   - CLAUDE.md의 filterItems 함수 기반으로 엣지케이스 포함 설계
   - optional 아이템 처리 방법

5. **MVP 구현 순서** (단계별)
   - 각 단계 완료 기준 포함

6. **Netlify 배포 설정**

계획서 작성 후 1단계부터 바로 시작해줘.
```

---

## STEP 2 — Codex CLI Scaffolding 명령어

Claude Code가 계획서를 완성하면 Codex CLI로 파일 구조 생성:

```bash
codex "React 프로젝트에서 다음 컴포넌트 파일들을 생성해줘.
각 파일은 기본 구조와 props 주석만 포함.

파일 목록:
- src/components/InputPanel.jsx
  props: { input, onChange } 
  내용: tent/nights/season/heater/igt/people 입력 폼
  
- src/components/PackingResult.jsx  
  props: { items, input }
  내용: 카테고리별 그룹화된 아이템 체크리스트
  
- src/components/CarVisualizer.jsx
  props: { items, input }
  내용: Model Y Juniper SVG 적재 도식
  
- src/components/RecipeResult.jsx
  props: { input }
  내용: 계절/인원 기반 요리 추천

- src/hooks/usePackingFilter.js
  input을 받아 필터링된 items 반환하는 커스텀 훅

각 파일에 TODO 주석으로 구현 포인트 표시해줘."
```

---

## STEP 3 — 이후 기능별 Claude Code 프롬프트

### CarVisualizer SVG 구현 시
```
/executing-plans

Model Y Juniper SVG 도식을 구현해줘.

요구사항:
- 2025 Juniper 상단 조감도 (탑뷰) 기준
- 5개 공간 구분: frunk / trunk_main / trunk_side / trunk_under / rear_seat
- 각 공간에 해당 아이템 목록 표시 (스크롤 가능한 텍스트 리스트)
- 아이템 수에 따라 공간 색상 강도 변화 (많을수록 진한 색)
- 반응형 (모바일에서도 동작)
- Tailwind CSS 사용
```

### 필터링 로직 구현 시
```
/test-driven-development

usePackingFilter 훅을 TDD로 구현해줘.

테스트 케이스 먼저 작성:
1. 에도쉘 솔캠, 겨울, 난로 on → 난로 포함되는지
2. 스테고, IGT none → IGT 테이블 제외되는지
3. 스테고, IGT basic → 사이드 더블랙 관련 아이템 제외되는지
4. 당일치기(nights=0) → nights_min: 1 아이템 제외되는지
5. optional 아이템은 기본 unchecked 상태인지

테스트 통과 후 구현 시작.
```

### 디버깅 발생 시
```
/systematic-debugging

[에러 내용 또는 증상 설명]

발생 조건: [재현 방법]
예상 동작: [어떻게 되어야 하는지]
실제 동작: [어떻게 되고 있는지]
```

---

## STEP 4 — Netlify 배포 설정

```bash
# netlify.toml 생성 (프로젝트 루트)
cat > netlify.toml << EOF
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF

git add netlify.toml
git commit -m "feat: add Netlify deployment config"
git push origin main
```

Netlify 대시보드에서:
1. "Add new site" → "Import an existing project"
2. GitHub 레포 선택 (campslay)
3. Branch: main, Build command: npm run build, Publish: dist
4. Deploy 클릭

---

## 참고 — 브랜치 작업 패턴

```bash
# 새 기능 시작
git checkout develop
git checkout -b feature/car-visualizer

# 작업 완료 후
git add .
git commit -m "feat: add Model Y SVG visualizer"
git checkout develop
git merge feature/car-visualizer
git push origin develop

# 배포 준비되면
git checkout main
git merge develop
git push origin main  # Netlify 자동 배포 트리거
```
