const SUMMER_RECIPES = [
  { name: '냉모밀과 초밥', desc: '더운 날 바로 먹기 좋은 조합. 조리 시간을 줄이기 좋습니다.' },
  { name: '차돌 비빔국수', desc: '차돌박이만 빠르게 굽고 비빔국수에 올립니다.' },
  { name: '새우 버터구이', desc: '버터와 마늘만 있으면 짧은 시간에 완성됩니다.' },
]

const RECIPES = {
  edoshell: {
    spring_fall: [
      { name: '삼겹살 구이', desc: '버너와 그리들로 간단하게 굽는 솔캠 기본 메뉴.' },
      { name: '짜파구리', desc: '준비물이 적고 밤 시간에 어울리는 라면 메뉴.' },
      { name: '소시지 구이', desc: '화로대나 팬 모두 잘 맞는 간단한 안주.' },
    ],
    winter: [
      { name: '부대찌개', desc: '난로를 켠 날 잘 어울리는 따뜻한 국물 메뉴.' },
      { name: '고구마 구이', desc: '화로대 잔불에 올려두기 좋은 간식.' },
      { name: '어묵탕', desc: '국물과 꼬치를 함께 준비하면 정리가 쉽습니다.' },
    ],
  },
  stego: {
    spring_fall: [
      { name: '그리들 삼겹살', desc: '가족캠에서 실패 확률이 낮은 기본 메뉴.' },
      { name: '바비큐 치킨', desc: '손질된 닭과 소스를 준비하면 조리가 단순합니다.' },
      { name: '불고기 볶음밥', desc: '남은 고기와 밥을 한 번에 정리하기 좋습니다.' },
    ],
    winter: [
      { name: '부대찌개', desc: '소시지, 김치, 라면으로 빠르게 끓이는 겨울 메뉴.' },
      { name: '된장찌개와 밥', desc: '아이와 함께 먹기 좋은 따뜻한 식사.' },
      { name: '핫초코와 컵라면', desc: '야식이나 아침 간식으로 부담이 적습니다.' },
    ],
  },
  dome_tarp: {
    summer: SUMMER_RECIPES,
  },
  dome_edoshell: {
    summer: SUMMER_RECIPES,
  },
}

const FOOD_BASE = {
  edoshell: ['물 2L', '햇반 3개', '라면 2개', '과자', '커피 또는 차', '쓰레기 봉투'],
  family: ['물 2L x 인원', '햇반', '간편 소스', '간식', '아이스박스 음료', '쓰레기 봉투'],
}

function FoodPresetSection({ input }) {
  const isSolo = input.tent === 'edoshell'
  const people = input.people ?? (isSolo ? 1 : 2)
  const items = [...(isSolo ? FOOD_BASE.edoshell : FOOD_BASE.family)]

  if (input.nights > 0) {
    items.push(isSolo ? `추가 물 ${input.nights * 2}L` : `추가 물 ${input.nights * people * 2}L`)
    items.push(isSolo ? `추가 햇반 ${input.nights * 2}개` : `추가 햇반 ${input.nights * people * 2}개`)
  }

  return (
    <section className="mt-4 rounded-lg border border-[#d4d9ce] bg-white/80 p-3">
      <h3 className="text-sm font-bold text-[#506036]">식재료 메모</h3>
      <ul className="mt-2 space-y-1">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-2 text-sm text-stone-700">
            <span className="text-[#506036]">○</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function RecipeResult({ input }) {
  const recipes = RECIPES[input.tent]?.[input.season] ?? []

  return (
    <aside>
      <h2 className="paper-section-title">Camp Kitchen</h2>
      <p className="paper-section-subtitle">요리 추천</p>

      {recipes.length === 0 ? (
        <p className="mt-3 rounded border border-dashed border-[#cfd5c7] bg-white/70 px-3 py-4 text-sm text-stone-500">
          해당 조건의 요리 추천을 준비 중입니다.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {recipes.map((recipe, index) => (
            <article key={recipe.name} className="rounded-lg border border-[#d4d9ce] bg-white px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded border border-[#506036] text-xs font-bold text-[#506036]">
                  {index + 1}
                </span>
                <h3 className="text-sm font-bold text-[#262820]">{recipe.name}</h3>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-stone-500">{recipe.desc}</p>
            </article>
          ))}
        </div>
      )}

      <FoodPresetSection input={input} />
    </aside>
  )
}
