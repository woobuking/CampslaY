import { useMemo, useState } from 'react'

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

const CATEGORY_ORDER = ['shelter', 'bedding', 'furniture', 'cooking', 'fire', 'heating',
  'lighting', 'electronics', 'electrical', 'hygiene', 'personal', 'container']

function groupByCategory(items) {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})
}

function getSortedCategories(grouped) {
  return [
    ...CATEGORY_ORDER.filter(c => grouped[c]),
    ...Object.keys(grouped).filter(c => !CATEGORY_ORDER.includes(c)),
  ]
}

function matchesSearch(item, query) {
  if (!query.trim()) return true
  const target = `${item.id} ${item.name} ${item.notes ?? ''}`.toLowerCase()
  return target.includes(query.trim().toLowerCase())
}

function ContainerSelect({ item, containers, onAssignContainer }) {
  if (item.category === 'container') return null

  return (
    <select
      value={item.storage_primary ?? ''}
      onClick={e => e.stopPropagation()}
      onChange={e => onAssignContainer(item.id, e.target.value)}
      aria-label="수납 여부"
      title="수납 여부"
      className="w-24 text-xs border border-stone-200 rounded px-1.5 py-1 bg-white text-stone-500"
    >
      <option value="">미수납</option>
      {containers.map(container => (
        <option key={container.id} value={container.id}>
          {container.name}
        </option>
      ))}
    </select>
  )
}

function ItemMeta({ item, isDefault, containersById }) {
  const badge = SPACE_BADGE[item.storage_secondary]
  const container = item.storage_primary ? containersById[item.storage_primary] : null

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1">
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${badge.cls}`}>{badge.label}</span>
      )}
      <span className={`text-[10px] font-semibold ${isDefault ? 'text-stone-500' : 'text-stone-400'}`}>
        {isDefault ? '기본 추천' : '수동 추가'}
      </span>
      {container && (
        <span className="text-[10px] text-stone-500">담김: {container.name}</span>
      )}
    </div>
  )
}

function ActiveItemRow({ item, packed, isDefault, containers, containersById, showContainerSelect, onTogglePacked, onToggleSelected, onAssignContainer }) {
  return (
    <li className="rounded border border-stone-200 bg-white px-2 py-2">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onTogglePacked(item.id)}
          className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center text-xs font-bold
            ${packed ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-stone-400 text-transparent'}`}
          aria-label={packed ? '체크 해제' : '체크 완료'}
        >
          ✓
        </button>
        <div className="flex-1 min-w-0">
          <button type="button" onClick={() => onTogglePacked(item.id)} className="block text-left">
            <span className={`text-sm leading-snug ${packed ? 'line-through decoration-2 decoration-stone-600 text-stone-500' : 'font-semibold text-stone-800'}`}>
              {item.name}
            </span>
          </button>
          <ItemMeta item={item} isDefault={isDefault} containersById={containersById} />
          {item.notes && !packed && (
            <p className="text-xs mt-1 leading-tight text-stone-400">{item.notes}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          {showContainerSelect && <ContainerSelect item={item} containers={containers} onAssignContainer={onAssignContainer} />}
          <button
            type="button"
            onClick={() => onToggleSelected(item.id)}
            className="text-xs px-2 py-1 rounded border border-stone-200 text-stone-500 hover:bg-stone-50"
          >
            빼기
          </button>
        </div>
      </div>
    </li>
  )
}

function InactiveItemRow({ item, isDefault, containers, containersById, showContainerSelect, onToggleSelected, onAssignContainer }) {
  return (
    <li className="rounded border border-stone-200 bg-stone-50 px-2 py-2">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onToggleSelected(item.id)}
          className="mt-0.5 w-5 h-5 rounded border border-stone-300 bg-white flex-shrink-0 flex items-center justify-center text-xs font-bold text-stone-500"
          aria-label="활성 아이템에 추가"
        >
          +
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-sm leading-snug text-stone-600">{item.name}</span>
          <ItemMeta item={item} isDefault={isDefault} containersById={containersById} />
          {item.notes && (
            <p className="text-xs mt-1 leading-tight text-stone-400">{item.notes}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          {showContainerSelect && <ContainerSelect item={item} containers={containers} onAssignContainer={onAssignContainer} />}
          <button
            type="button"
            onClick={() => onToggleSelected(item.id)}
            className="text-xs px-2 py-1 rounded bg-stone-800 text-white hover:bg-stone-700"
          >
            추가
          </button>
        </div>
      </div>
    </li>
  )
}

function CategorySection({ category, items, renderItem }) {
  const [collapsed, setCollapsed] = useState(false)
  const meta = CATEGORY_META[category] || { label: category, icon: '📋' }

  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-white hover:bg-stone-50 transition-colors text-left"
      >
        <span className="text-base">{meta.icon}</span>
        <span className="font-semibold text-sm flex-1 text-stone-700">{meta.label}</span>
        <span className="text-xs text-stone-400">{items.length}개</span>
        <span className="text-stone-400 text-xs">{collapsed ? '▶' : '▼'}</span>
      </button>
      {!collapsed && (
        <ul className="px-2 pb-2 pt-1.5 space-y-1 bg-white">
          {items.map(renderItem)}
        </ul>
      )}
    </div>
  )
}

function ItemColumn({ title, description, items, query, onQueryChange, renderItem, active }) {
  const filteredItems = useMemo(
    () => items.filter(item => matchesSearch(item, query)),
    [items, query],
  )
  const grouped = groupByCategory(filteredItems)
  const sortedCategories = getSortedCategories(grouped)

  return (
    <section className={`rounded-lg border p-3 ${active ? 'border-stone-800 bg-white shadow-sm' : 'border-dashed border-stone-300 bg-stone-100/80'}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className={`text-sm font-bold ${active ? 'text-stone-900' : 'text-stone-500'}`}>{title}</h3>
          <p className="text-xs text-stone-400 mt-0.5">{description}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${active ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-500'}`}>
          {filteredItems.length}/{items.length}
        </span>
      </div>

      <input
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        placeholder="아이템 검색"
        className="w-full text-sm border border-stone-200 rounded px-2.5 py-1.5 mb-2 bg-white focus:outline-none focus:border-stone-400"
      />

      {filteredItems.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-6">검색 결과가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {sortedCategories.map(cat => (
            <CategorySection
              key={cat}
              category={cat}
              items={grouped[cat]}
              renderItem={renderItem}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function ContainerSummary({ items, selectedIds }) {
  const [openContainerId, setOpenContainerId] = useState(null)
  const selectedItems = items.filter(item => selectedIds.has(item.id))
  const containers = selectedItems.filter(item => item.category === 'container')
  const assignedItems = selectedItems.filter(item => item.category !== 'container' && item.storage_primary)
  const openContainer = containers.find(container => container.id === openContainerId)
  const openItems = openContainer
    ? assignedItems.filter(item => item.storage_primary === openContainer.id)
    : []

  return (
    <section className="rounded-lg border border-stone-200 bg-stone-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-stone-800">수납 여부</h3>
          <p className="text-xs text-stone-400 mt-0.5">박스를 누르면 들어간 아이템을 확인합니다.</p>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-stone-200 text-stone-500">
          {assignedItems.length}개 지정
        </span>
      </div>
      {containers.length > 0 && (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {containers.map(container => {
            const count = assignedItems.filter(item => item.storage_primary === container.id).length
            return (
              <button
                key={container.id}
                type="button"
                onClick={() => setOpenContainerId(openContainerId === container.id ? null : container.id)}
                className={`rounded border px-2 py-1.5 text-left transition-colors
                  ${openContainerId === container.id
                    ? 'border-stone-800 bg-white text-stone-900'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'}`}
              >
                <span className="block text-xs font-semibold truncate">{container.name}</span>
                <span className="text-[10px] text-stone-400">{count}개 수납</span>
              </button>
            )
          })}
        </div>
      )}
      {openContainer && (
        <div className="mt-2 rounded border border-stone-200 bg-white p-2">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="text-xs font-bold text-stone-800">{openContainer.name}</p>
            <span className="text-[10px] text-stone-400">{openItems.length}개</span>
          </div>
          {openItems.length === 0 ? (
            <p className="text-xs text-stone-400">아직 수납된 아이템이 없습니다.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
              {openItems.map(item => (
                <li key={item.id} className="text-xs text-stone-600 truncate">
                  · {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default function PackingResult({
  items,
  matchedIds,
  selectedIds,
  packedIds,
  onToggleSelected,
  onTogglePacked,
  onResetPacked,
  onResetSelection,
  onAssignContainer,
}) {
  const [activeQuery, setActiveQuery] = useState('')
  const [inactiveQuery, setInactiveQuery] = useState('')
  const [showContainerSelect, setShowContainerSelect] = useState(false)

  const containersById = items
    .filter(item => item.category === 'container')
    .reduce((acc, item) => ({ ...acc, [item.id]: item }), {})
  const activeContainers = items.filter(item => item.category === 'container' && selectedIds.has(item.id))
  const activeItems = items.filter(item => selectedIds.has(item.id))
  const inactiveItems = items.filter(item => !selectedIds.has(item.id))
  const defaultRemovedCount = inactiveItems.filter(item => matchedIds.has(item.id)).length

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-bold text-base text-stone-800">체크리스트</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            완료 {packedIds.size}/{activeItems.length} · 저장 대상 {activeItems.length}개 · 비활성 {inactiveItems.length}개
          </p>
        </div>
        <div className="flex items-center gap-3">
          {packedIds.size > 0 && (
            <button onClick={onResetPacked} className="text-xs text-stone-400 hover:text-stone-600 underline">
              체크 초기화
            </button>
          )}
          <button
            onClick={() => setShowContainerSelect(v => !v)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              showContainerSelect
                ? 'bg-stone-800 border-stone-800 text-white'
                : 'bg-white border-stone-300 text-stone-500 hover:border-stone-500'
            }`}
          >
            수납 지정
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-8">조건에 맞는 아이템이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          <ContainerSummary items={items} selectedIds={selectedIds} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <ItemColumn
              title="활성 체크리스트"
              description="체크하면 챙김 완료, 빼기는 저장 대상에서 제외"
              items={activeItems}
              query={activeQuery}
              onQueryChange={setActiveQuery}
              active
              renderItem={item => (
                <ActiveItemRow
                  key={item.id}
                  item={item}
                  packed={packedIds.has(item.id)}
                  isDefault={matchedIds.has(item.id)}
                  containers={activeContainers}
                  containersById={containersById}
                  showContainerSelect={showContainerSelect}
                  onTogglePacked={onTogglePacked}
                  onToggleSelected={onToggleSelected}
                  onAssignContainer={onAssignContainer}
                />
              )}
            />
            <ItemColumn
              title="비활성 아이템"
              description={`검색 후 추가. 기본에서 뺀 항목 ${defaultRemovedCount}개`}
              items={inactiveItems}
              query={inactiveQuery}
              onQueryChange={setInactiveQuery}
              active={false}
              renderItem={item => (
                <InactiveItemRow
                  key={item.id}
                  item={item}
                  isDefault={matchedIds.has(item.id)}
                  containers={activeContainers}
                  containersById={containersById}
                  showContainerSelect={showContainerSelect}
                  onToggleSelected={onToggleSelected}
                  onAssignContainer={onAssignContainer}
                />
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}
