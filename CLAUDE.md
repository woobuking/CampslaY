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
  presets: string[],            // P01-P09 포함 프리셋 번호 목록
  storage_primary: string | null,
  storage_secondary: string,    // frunk | trunk | trunk_under | cabin
  required: boolean,
  purchase: boolean,
  notes: string,
  conditions: {
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
└── SavePresetModal.jsx     # 프리셋별 체크 상태 저장 모달
```

## 상태 관리
- `input`: 6개 조건 (App.jsx에서 관리)
- `checkedIds`: Set<string> — App.jsx에서 관리, PackingResult/CarVisualizer에 props로 전달
- React Query: items (`queryKey: ['items']`), presets (`queryKey: ['presets']`)

## Claude/Codex 공유 작업 로그
이 파일은 Claude와 Codex가 함께 보는 공용 인수인계 문서다.
큰 구조 변경, 데이터 스키마 변경, API/스프레드시트 동기화, 배포 관련 변경은 작업 직후 이 섹션에 기록한다.

기록 형식:
- 날짜 / 작업자
- 변경 요약
- 동기화 상태
- 다음 작업자가 주의할 점

### 2026-04-17 / Codex
- 아이템 데이터의 텐트 조건을 `conditions.tent` 중심에서 `presets: string[]` 중심으로 변경.
- `items.json`, `campslay-items.csv`, `campslay-items-new.csv`, Google Sheets `items` 시트를 같은 구조로 동기화.
- Google Sheets `items` 시트 헤더는 `id, name, category, storage_primary, storage_secondary, required, purchase, notes, presets, season, heater, igt, people_min, nights_min`.
- `tent` 컬럼은 아이템 데이터셋에서 제거 대상이며, 현재 원격 items API 응답에도 `conditions.tent` 없이 `presets`가 내려오는 상태.
- `돔텐트+타프`(`S003`)와 `돔텐트+에도쉘`(`S004`) 아이템을 추가했고 각각 P06/P07, P08/P09에 포함.
- P01 명칭은 `에도쉘 캠프닉`으로 변경.
- 체크리스트는 조건에 맞지 않는 아이템도 숨기지 않고 음영 처리하는 방향을 유지.
- People 조건은 복잡도를 줄이기 위해 솔캠/가족캠 두 분류만 유지하는 방향.
- 프리셋 저장은 `presets` 시트에 저장된다. 현재 Apps Script는 저장 시 기존 행 업데이트가 아니라 `appendRow`로 새 행을 추가한다.
- 앱은 같은 preset id가 여러 개 있으면 최신 저장값을 쓰는 구조다. 나중에 필요하면 P01-P09를 한 줄씩만 유지하는 upsert 방식으로 `Code.gs`를 바꿀 수 있다.
- 2026-04-17 22:25 KST 기준 P01 저장 확인 완료: `getPresets` 응답에 P01 1개, 체크 아이템 26개 저장됨.
- `npm run lint`, `npm run build` 통과 확인.
- 저장된 preset은 앱 시작, preset 재선택, presets 재조회 시 현재 조건의 활성 아이템으로 다시 체크 상태를 복원하도록 변경.
- 체크리스트는 `활성 아이템`과 `비활성 아이템` 컬럼으로 분리. 비활성 아이템은 목록에 계속 보이지만 체크/저장 대상에서 제외.
- 적재 도식은 체크 상태를 받아 체크된 아이템에 체크 표시, 취소선, 공간별 완료 카운트를 표시.
- 위 UI/상태 변경 후 `npm run lint`, `npm run build` 통과 확인. 로컬 개발 서버는 `http://127.0.0.1:5173/`.
- preset 저장본이 있으면 저장된 `checked_ids`를 실제 활성 아이템 목록으로 사용하도록 변경. DB 기본 매칭은 기본 추천값으로만 표시한다.
- 비활성 아이템도 클릭하면 활성 목록에 추가되고 저장 대상에 포함된다. 컨테이너에 드래그해도 자동 활성화된다.
- `C007 캠프원 버너플레이트 세트`는 P01에서 제외하고 P02 전용으로 변경. `L002 첨스 파우치 (봄가을 가족)`은 `첨스 파우치`로 변경.
- `storage_primary` 컨테이너 선택을 AddItemModal에 복구했고, 체크리스트에서 활성 컨테이너로 아이템을 드래그해 담는 UI를 추가.
- 로컬 `Code.gs`에는 `updateItemContainer` 액션을 추가했지만, Apps Script 배포본은 아직 이 액션을 모른다. 영구 드래그 저장을 쓰려면 Apps Script 에디터에서 `appscript/Code.gs`를 반영하고 새 버전으로 재배포해야 한다.
- `items.json` 변경 후 `npm run export:csv`, `npm run upload`로 CSV와 Google Sheets items 시트 동기화 완료. `npm run lint`, `npm run build` 통과 확인.
- 이후 Google Sheets에서 직접 수정한 items를 로컬로 다시 가져옴. 로컬 `items.json`, `campslay-items.csv`, `campslay-items-new.csv`는 시트 기준 52개 아이템 상태.
- 시트 기준으로 `FR001`은 제거됨. 변경 확인된 항목: `F005`, `F007`, `F011`, `F012`, `F013`, `F014`, `C009`, `C010`.
- 시트 -> 로컬 동기화 후에는 `npm run upload`를 실행하지 않음. `npm run export:csv`, `npm run lint`, `npm run build` 통과 확인.
- 신규 가구 아이템 4개 추가 후 Google Sheets items 시트까지 업로드 완료. 전체 items 수는 56개.
- 추가 항목: `F016 IGT 더블랙`, `F017 더블랙용 사이드 행어`, `F018 인디언 행어`, `F019 인디언 행어 우드 상판`.
- `F016`, `F017`은 IGT Full 전용 preset `P04/P05/P07/P09`. `F018`, `F019`는 가족캠 공통 preset `P03-P09`.
- 신규 항목 추가 후 `npm run export:csv`, `npm run lint`, `npm run build`, `npm run upload` 통과 및 원격 API에서 56개/신규 4개 확인.
- 체크리스트 상태를 `selectedIds`(Preset 저장 대상/활성 아이템)와 `packedIds`(실제 챙김 완료 체크)로 분리.
- 드래그는 주요 동선에서 제외하고, 활성/비활성 목록 검색 + `추가`/`빼기` 버튼 + 컨테이너 select로 아이템을 관리하도록 변경.
- 적재 도식은 `selectedIds` 기준으로 표시하고, 취소선/완료 카운트는 `packedIds` 기준으로 표시.
- Preset 저장 모달의 문구는 `저장 대상 아이템` 기준으로 변경. 체크 완료 상태는 Preset 저장값에 포함하지 않음.
- 체크리스트/상태 분리 후 `npm run lint`, `npm run build` 통과 확인.
- `수납 지정` UI를 `수납 여부`로 축소 표현. 아이템별 select 기본값은 `미수납`으로 표시.
- 수납 컨테이너 요약에서 `토르박스 75L` 같은 컨테이너를 클릭하면 내부 수납 아이템 목록을 펼쳐서 볼 수 있도록 변경.
- 활성/비활성 목록의 시각 차이를 더 크게 조정. 변경 후 `npm run lint`, `npm run build` 통과 확인.
- `F020 IGT 언더 쉘프` 추가. IGT Full 전용 preset `P04/P05/P07/P09`, category `furniture`, storage `trunk`.
- 신규 항목 추가 후 `npm run export:csv`, `npm run lint`, `npm run build`, `npm run upload` 통과 및 원격 API에서 전체 57개/F020 확인.
- 수납 여부는 preset별 `storage_map`으로 중복 저장하지 않고, items 시트의 `storage_primary`를 단일 기준으로 사용하기로 정리.
- Preset 저장은 다시 활성 아이템 목록(`checked_ids`)만 기록한다. 수납 위치 변경은 `updateItemContainer`로 items 시트의 `storage_primary`에 직접 저장된다.
- `storage_map` 중복 저장 제거 후 `npm run lint`, `npm run build` 통과 확인.

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
