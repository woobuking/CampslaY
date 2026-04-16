# CampslaY — 캠핑 스마트 패킹 어시스턴트

## 프로젝트 개요
캠핑 조건을 입력하면 Tesla Model Y 2025 Juniper 기준으로
적재 공간별 짐 배치와 아이템 체크리스트, 캠핑 요리를 출력하는 웹앱.

## 기술 스택
- React + Vite
- Tailwind CSS
- 데이터: src/data/items.json (PDF 기반 변환 완료)
- 배포: Netlify
- 버전 관리: GitHub (main 브랜치 보호, feature 브랜치 전략)

## 입력 변수 (6가지)
| 변수 | 타입 | 값 |
|------|------|-----|
| tent | string | "edoshell" (에도쉘 솔캠) \| "stego" (스테고 가족캠핑) |
| nights | number | 0(당일) \| 1(1박) \| 2(2박) |
| season | string | "spring_fall" \| "winter" |
| heater | boolean | true \| false |
| igt | string | "none" \| "basic" \| "full" |
| people | number | 1~6 |

### IGT 구성 정의
- `none`: IGT 없음
- `basic`: 메인 프레임 + 탑만 (사이드 더블랙, 언더쉘프 제외)
- `full`: 사이드 더블랙 + 언더쉘프 포함 전체 구성

## 출력 (3가지)
1. **Model Y Juniper SVG 도식** — 공간별 아이템 배치 시각화
2. **아이템 체크리스트** — 조건 필터링된 카테고리별 목록
3. **캠핑 요리 추천** — 계절/인원 기반 3~5가지

## 적재 공간 정의 (Model Y 2025 Juniper) — 3구역
```
frunk        프렁크 (전면 트렁크)    — 쉘터류 전용
trunk        트렁크                  — 메인 장비 전체 (사이드 포함)
trunk_under  지하실                  — 카즈미 100L 캠핑백 적재. 무박(nights=0) 시 미사용
```

### 공간 운영 규칙
- 차박 없음 — 뒷좌석은 탑승 공간 전용
- 워터저그·난로 등 차량 내부 탑승 공간 아이템은 `trunk`로 분류,
  items.json notes 필드에 "차량 내 적재 — [위치]" 형식으로 위치 명시
- **무박(nights=0) 시**: `trunk_under` 아이템 전체 제외
  (카즈미 캠핑백 포함 지하실 짐 불필요)

## 박스 치수 (참고용)
- 토르박스 75L / 플라스틱 캠핑박스: 708(W) × 434(D) × 384(H) mm

## 데이터 구조 (items.json)
각 아이템은 conditions 객체로 필터링:
```javascript
{
  tent: "edoshell" | "stego" | "both",
  season: "spring_fall" | "winter" | "all",
  heater: null | true | false,      // null = 무관
  igt: null | "none" | "basic" | "full" | "basic_full",
  people_min: number,
  nights_min: number
}
```

## 필터링 로직 (핵심)
```javascript
function filterItems(items, input) {
  return items.filter(item => {
    const c = item.conditions;
    // 공간: 무박이면 지하실 아이템 전체 제외
    if (input.nights === 0 && item.space === "trunk_under") return false;
    // tent
    if (c.tent !== "both" && c.tent !== input.tent) return false;
    // season
    if (c.season !== "all" && c.season !== input.season) return false;
    // heater
    if (c.heater !== null && c.heater !== input.heater) return false;
    // igt
    if (c.igt !== null) {
      if (c.igt === "basic_full" && input.igt === "none") return false;
      if (c.igt !== "basic_full" && c.igt !== input.igt) return false;
    }
    // people & nights
    if (input.people < c.people_min) return false;
    if (input.nights < c.nights_min) return false;
    return true;
  });
}
```

## 컴포넌트 구조
```
App.jsx
├── InputPanel.jsx          # 6개 입력값 UI
├── CarVisualizer.jsx       # Model Y SVG 도식 (3구역)
├── PackingResult.jsx       # 카테고리별 체크리스트
└── RecipeResult.jsx        # 계절별 요리 추천
```

## 개발 원칙
- 새 기능 전 반드시 /writing-plans 실행
- 구현은 /test-driven-development 방식
- 완료 전 /verification-before-completion 체크
- 버그 발생 시 /systematic-debugging
- PR 전 /finishing-a-development-branch

## 브랜치 전략
- `main`: 배포 브랜치 (Netlify 연동)
- `develop`: 통합 브랜치
- `feature/[기능명]`: 기능 개발
- 커밋 메시지: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`

## 환경
- Node.js 18+
- VS Code + Claude Code + Codex CLI
- Netlify 자동 배포 (main push 시)
