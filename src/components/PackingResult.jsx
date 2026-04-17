import { useState } from 'react'

const CATEGORY_META = {
  shelter:     { label: '쉘터',       icon: '⛺' },
  lighting:    { label: '조명',       icon: '💡' },
  bedding:     { label: '침구',       icon: '🛏️' },
  furniture:   { label: '가구/테이블', icon: '🪑' },
  cooking:     { label: '조리',       icon: '🍳' },
  fire:        { label: '화로',       icon: '🔥' },
  heating:     { label: '난방',       icon: '♨️' },
  electronics: { label: '전자기기',   icon: '📱' },
  electrical:  { label: '전기',       icon: '🔌' },
  personal:    { label: '개인용품',   icon: '👕' },
  hygiene:     { label: '위생',       icon: '🧼' },
  container:   { label: '수납',       icon: '📦' },
}

const SPACE_BADGE = {
  frunk:       { label: '프렁크', cls: 'bg-blue-100 text-blue-700' },
  trunk:       { label: '트렁크', cls: 'bg-green-100 text-green-700' },
  trunk_under: { label: '지하실', cls: 'bg-amber-100 text-amber-700' },
  cabin:       { label: '뒷좌석', cls: 'bg-pink-100 text-pink-700' },
}

function ItemRow({ item, checked, onToggle, matched }) {
  const badge = SPACE_BADGE[item.storage_secondary]
  return (
    <li
      className={`flex items-start gap-2 py-1.5 px-1 rounded cursor-pointer select-none hover:bg-stone-50 transition-colors ${checked ? 'opacity-50' : !matched ? 'opacity-30' : ''}`}
      onClick={() => onToggle(item.id)}
    >
      <span className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs
        ${checked ? 'bg-stone-400 border-stone-400 text-white' : 'border-stone-300 bg-white'}`}>
        {checked ? '✓' : ''}
      </span>
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${checked ? 'line-through' : matched ? 'text-stone-800 font-semibold' : 'text-stone-400'}`}>{item.name}</span>
        {!item.required && (
          <span className="ml-1.5 text-xs text-stone-400">(선택)</span>
        )}
        {item.notes && !checked && (
          <p className="text-xs text-stone-400 mt-0.5 leading-tight">{item.notes}</p>
        )}
      </div>
      {badge && (
        <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${badge.cls}`}>{badge.label}</span>
      )}
    </li>
  )
}

function CategorySection({ category, items, checkedIds, onToggle, matchedIds }) {
  const [collapsed, setCollapsed] = useState(false)
  const meta = CATEGORY_META[category] || { label: category, icon: '📋' }
  const doneCount = items.filter(i => checkedIds.has(i.id)).length
  const matchedCount = items.filter(i => matchedIds.has(i.id)).length

  return (
    <div className="border border-stone-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
      >
        <span className="text-base">{meta.icon}</span>
        <span className="font-semibold text-sm text-stone-700 flex-1">{meta.label}</span>
        <span className="text-xs text-stone-400">{doneCount}/{matchedCount}</span>
        <span className="text-stone-400 text-xs">{collapsed ? '▶' : '▼'}</span>
      </button>
      {!collapsed && (
        <ul className="px-3 pb-2 pt-1 space-y-0.5">
          {items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              checked={checkedIds.has(item.id)}
              onToggle={onToggle}
              matched={matchedIds.has(item.id)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default function PackingResult({ items, matchedIds }) {
  const [checkedIds, setCheckedIds] = useState(new Set())

  const toggleItem = id => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const resetAll = () => setCheckedIds(new Set())

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const categoryOrder = ['shelter', 'bedding', 'furniture', 'cooking', 'fire', 'heating',
    'lighting', 'electronics', 'electrical', 'hygiene', 'personal', 'container']
  const sortedCategories = [
    ...categoryOrder.filter(c => grouped[c]),
    ...Object.keys(grouped).filter(c => !categoryOrder.includes(c)),
  ]

  const totalDone = checkedIds.size
  const totalMatched = matchedIds.size

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-base text-stone-800">체크리스트</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500">{totalDone}/{totalMatched} 완료</span>
          {totalDone > 0 && (
            <button onClick={resetAll} className="text-xs text-stone-400 hover:text-stone-600 underline">
              초기화
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-8">조건에 맞는 아이템이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {sortedCategories.map(cat => (
            <CategorySection
              key={cat}
              category={cat}
              items={grouped[cat]}
              checkedIds={checkedIds}
              onToggle={toggleItem}
              matchedIds={matchedIds}
            />
          ))}
        </div>
      )}
    </div>
  )
}
