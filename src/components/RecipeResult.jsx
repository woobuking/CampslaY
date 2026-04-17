import { getFoodPreset } from '../data/foodPresets'
import { getDefaultPeople } from '../lib/presets'

const SUMMER_FAMILY_RECIPES = [
  { name: '냉모밀 + 유부초밥', desc: '더운 날 먹기 편한 한 끼. 최소 조리로 바로 완성.' },
  { name: '차돌 비빔국수', desc: '차돌박이만 빠르게 굽고 비빔국수에 얹기 좋음.' },
  { name: '오꼬노미야끼', desc: '그리들 한 판 요리로 아이들까지 같이 먹기 좋음.' },
  { name: '대패삼겹 숙주볶음', desc: '대패삼겹과 숙주를 센 불에 빠르게 볶는 여름 메뉴.' },
  { name: '새우 버터구이', desc: '버터와 마늘만 챙기면 짧게 조리해도 만족감이 큼.' },
]

const RECIPES = {
  edoshell: {
    spring_fall: [
      { name: '삼겹살 + 쌈', desc: '버너에 그릴 올려 삼겹살 구이. 쌈야채 곁들이기.' },
      { name: '짜파구리', desc: '짜파게티 + 오징어짬뽕. 솔캠 야간 라면의 정석.' },
      { name: '소시지 구이', desc: '화로대 위 직화 소시지. 간단하고 맛있음.' },
      { name: '참치 야채 볶음밥', desc: '햇반 + 참치 + 양파. 캠프원 버너 활용.' },
      { name: '어묵 탕', desc: '작은 냄비에 어묵 + 다시마육수. 야식으로 최고.' },
    ],
    winter: [
      { name: '부대찌개', desc: '햄 + 소시지 + 라면 + 김치. 겨울 캠핑 필수 요리.' },
      { name: '짜파구리', desc: '짜파게티 + 오징어짬뽕. 추운 날 한 그릇.' },
      { name: '고구마 구이', desc: '화로대 직화. 은박지로 싸서 잉걸불에.' },
      { name: '닭볶음탕', desc: '손질 닭 + 양념장. 미리 준비해오면 편함.' },
      { name: '어묵 탕', desc: '겨울 야식의 정답. 따뜻한 국물.' },
    ],
  },
  stego: {
    spring_fall: [
      { name: '그리들 삼겹살', desc: '그리들 달궈 삼겹살 + 파채. 가족 모두 좋아하는 메뉴.' },
      { name: '밀키트 요리', desc: '시판 밀키트 활용. 재료 손질 없이 간편하게.' },
      { name: '떡볶이', desc: '그리들에 떡볶이 + 순대. 아이들 좋아함.' },
      { name: '바비큐 치킨', desc: '마리네이드한 닭다리 숯불 직화. 차콜스타터 활용.' },
      { name: '소불고기 + 쌈', desc: '불고기 + 채소 + 버섯. 그리들에 볶아서 쌈으로.' },
    ],
    winter: [
      { name: '그리들 삼겹살', desc: '겨울엔 더 맛있는 직화 삼겹살. 해바라기 버너 활용.' },
      { name: '부대찌개', desc: '햄 + 소시지 + 김치 + 라면. 온 가족 포만감.' },
      { name: '된장찌개 + 밥', desc: '간단한 된장찌개에 햇반. 아침 식사로 완벽.' },
      { name: '어묵탕 꼬치', desc: '어묵 꼬치에 다시마 육수. 아이들 간식으로 좋음.' },
      { name: '핫초코 & 컵라면', desc: '야간 야식. 커피포트로 물 끓여 즉석 완성.' },
    ],
  },
  dome_tarp: {
    summer: SUMMER_FAMILY_RECIPES,
  },
  dome_edoshell: {
    summer: SUMMER_FAMILY_RECIPES,
  },
}

function FoodPresetSection({ input }) {
  const preset = getFoodPreset(input.tent)
  const people = input.people ?? getDefaultPeople(input.tent)

  if (!preset) return null

  const items = [...preset.base]
  const isSolo = input.tent === 'edoshell'

  if (input.nights > 0) {
    const perNight = isSolo ? preset.per_night : preset.per_night_per_person
    if (perNight) {
      Object.entries(perNight).forEach(([key, val]) => {
        const qty = typeof val === 'number'
          ? isSolo
            ? `${val * input.nights}`
            : `${val * input.nights * people}`
          : `${val}`
        items.push(`${key} ${qty}${typeof val === 'number' ? '개/팩' : ''}`)
      })
    }
  }

  return (
    <div className="mt-4 border border-stone-100 rounded-lg overflow-hidden">
      <div className="bg-stone-50 px-3 py-2">
        <span className="font-semibold text-sm text-stone-700">🧺 식재료 준비 목록</span>
      </div>
      <ul className="px-3 py-2 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-stone-700 flex gap-2">
            <span className="text-stone-400">·</span>{item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function RecipeResult({ input }) {
  const recipes = RECIPES[input.tent]?.[input.season] ?? []

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
      <h2 className="font-bold text-base text-stone-800 mb-3">요리 추천</h2>

      {recipes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-200 px-3 py-4 text-sm text-stone-400">
          해당 조건용 요리 추천을 준비 중입니다.
        </p>
      ) : (
        <div className="space-y-2">
          {recipes.map((recipe, i) => (
            <div key={i} className="border border-stone-100 rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-400 w-4">{i + 1}</span>
                <span className="font-semibold text-sm text-stone-800">{recipe.name}</span>
              </div>
              <p className="text-xs text-stone-500 mt-1 ml-6 leading-relaxed">{recipe.desc}</p>
            </div>
          ))}
        </div>
      )}

      <FoodPresetSection input={input} />
    </div>
  )
}
