# CampslaY — 캠핑 스마트 패킹 어시스턴트

## 프로젝트 개요
캠핑 조건을 입력하면 Tesla Model Y 2025 Juniper 기준으로
적재 공간별 짐 배치와 아이템 체크리스트, 캠핑 요리를 출력하는 웹앱.

## 기술 스택
- React 19 + Vite 8
- Tailwind CSS v4
- @tanstack/react-query (데이터 캐싱/패칭)
- Google Sheets + Google Apps Script (백엔드 DB + API)
- 배포: Netlify (main 브랜치 자동 배포)
- 버전 관리: GitHub https://github.com/woobuking/CampslaY
- PWA: vite-plugin-pwa

## 입력 변수
| 변수 | 타입 | 값 |
|------|------|-----|
| tent | string | "edoshell" \| "stego" \| "dome_tarp" \| "dome_edoshell" |
| nights | number | 0(당일) \| 1(1박이상) |
| season | string | "spring_fall" \| "summer" \| "winter" |
| heater | boolean | true \| false (겨울이면 항상 true) |
| igt | string | "none" \| "basic" \| "full" |
| people | number | (미사용 — 솔캠/가족캠은 tent로 구분) |

### 텐트 분류
- `edoshell`: 에도쉘 솔캠 (혼자, IGT 없음)
- `stego`: 스테고 가족캠 (IGT 있음)
- `dome_tarp`: 돔텐트+타프 가족캠 (IGT 있음)
- `dome_edoshell`: 돔텐트+에도쉘 가족캠 (IGT 있음)

### IGT 구성 정의
- `none`: IGT 없음 (에도쉘 솔캠 전용)
- `basic`: 메인 프레임 + 탑만 (사이드 더블랙, 언더쉘프 제외)
- `full`: 사이드 더블랙 + 언더쉘프 포함 전체 구성 (Highest)

## 조건 제약 규칙
1. **겨울 = 난로 ON** 고정 (난로 없는 겨울 없음)
2. **돔텐트** (dome_tarp, dome_edoshell) = **여름만** 사용
3. **당일치기** = **에도쉘만** (스테고/돔 계열은 1박이상만)
4. **에도쉘** = 솔캠 전용 (IGT 없음 고정)
5. **에도쉘** = 봄가을만 (겨울/여름 미사용)
6. **스테고** = 봄가을/겨울만 (여름 미사용)
7. **겨울 IGT** = Full만 (Basic 없음)

## 프리셋 번호 (P01–P09)
| # | 텐트 | 계절 | 날수 | 난로 | IGT |
|---|------|------|------|------|-----|
| P01 | 에도쉘 | 봄가을 | 당일 | OFF | - |
| P02 | 에도쉘 | 봄가을 | 1박이상 | OFF | - |
| P03 | 스테고 | 봄가을 | 1박이상 | OFF | Basic |
| P04 | 스테고 | 봄가을 | 1박이상 | OFF | Full |
| P05 | 스테고 | 겨울 | 1박이상 | ON | Full |
| P06 | 돔+타프 | 여름 | 1박이상 | OFF | Basic |
| P07 | 돔+타프 | 여름 | 1박이상 | OFF | Full |
| P08 | 돔+에도쉘 | 여름 | 1박이상 | OFF | Basic |
| P09 | 돔+에도쉘 | 여름 | 1박이상 | OFF | Full |

## 출력 (3가지)
1. **Model Y Juniper SVG 도식** — 공간별 아이템 배치 시각화
2. **아이템 체크리스트** — 조건 필터링된 카테고리별 목록
3. **캠핑 요리 추천** — 계절 기반 3~5가지

## 적재 공간 정의 (Model Y 2025 Juniper) — 3구역
```
frunk        프렁크 (전면 트렁크)    — 쉘터류 전용
trunk        트렁크                  — 메인 장비 전체 (사이드 포함)
trunk_under  지하실                  — 카즈미 100L 캠핑백 적재. 무박(nights=0) 시 미사용
```

### 공간 운영 규칙
- 차박 없음 — 뒷좌석은 탑승 공간 전용
- 워터저그·난로 등 차량 내부 탑승 공간 아이템은 `trunk`로 분류,
  items notes 필드에 "차량 내 적재 — [위치]" 형식으로 위치 명시
- **무박(nights=0) 시**: `trunk_under` 아이템 전체 제외

## 데이터 구조 (Google Sheets items 시트)
각 아이템은 conditions 객체로 필터링:
```javascript
{
  id: string,
  name: string,
  category: string,
  storage_primary: string | null,
  storage_secondary: string,    // frunk | trunk | trunk_under | cabin
  required: boolean,
  purchase: boolean,
  notes: string,
  conditions: {
    tent: "edoshell" | "stego" | "dome_tarp" | "dome_edoshell" | "both" | "all",
    season: "spring_fall" | "summer" | "winter" | "all",
    heater: null | true | false,
    igt: null | "none" | "basic" | "full" | "basic_full",
    people_min: number,
    nights_min: number
  }
}
```

## 카테고리 및 ID 접두사
| 카테고리 | 접두사 |
|---------|--------|
| shelter | S |
| lighting | L |
| bedding | B |
| furniture | F |
| cooking | C |
| fire | FR |
| heating | H |
| electronics | E |
| electrical | E |
| personal | P |
| hygiene | HY |
| container | BOX |

## API (Google Apps Script)
- URL: `https://script.google.com/macros/s/AKfycbzdwDcBgD39-ncq-mfji1kqni0raWHNEaSUTdntCy74IRlDQ7FUD1lwUmMFDgMDvkBzQQ/exec`
- GET (no CORS 이슈): fetchItems, addItem, savePreset, getPresets
- POST: 아이템 bulk upload

### Code.gs 변경 시
Google Apps Script 에디터에서 직접 수정 후 **새 버전으로 재배포** 필요.
(Apps Script URL은 재배포해도 동일하게 유지됨)

## 컴포넌트 구조
```
App.jsx
├── InputPanel.jsx          # 입력값 UI (조건 선택)
├── CarVisualizer.jsx       # Model Y SVG 도식 (3구역)
├── PackingResult.jsx       # 카테고리별 체크리스트 (checkedIds props)
├── RecipeResult.jsx        # 계절별 요리 추천
├── AddItemModal.jsx        # 새 아이템 추가 (ID 자동생성)
├── SavePresetModal.jsx     # 조건 저장 모달
└── PresetLoader.jsx        # 저장된 조건 불러오기 드롭다운
```

## 상태 관리
- `input`: 6개 조건 (App.jsx에서 관리)
- `checkedIds`: Set<string> — App.jsx에서 관리, PackingResult/CarVisualizer에 props로 전달
- React Query: items (`queryKey: ['items']`), presets (`queryKey: ['presets']`)

## 개발 원칙
- **Data 정확성 최우선** — 필터링 로직과 아이템 데이터의 정합성이 핵심
- 새 기능 전 계획 확인
- Apps Script 수정 후 반드시 재배포 확인

## 브랜치 전략
- `main`: 배포 브랜치 (Netlify 연동)
- 커밋 메시지: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`

## 환경
- Node.js 20+ (Netlify .nvmrc 설정됨)
- VS Code + Claude Code
- Netlify 자동 배포 (main push 시)
