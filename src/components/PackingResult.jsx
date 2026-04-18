import { useMemo, useState } from 'react'
import PaperIllustrationSlot from './PaperIllustrationSlot'

const CATEGORY_META = {
  shelter: { label: 'SHELTER', sub: '텐트와 쉘터' },
  tent: { label: 'SHELTER', sub: '텐트와 쉘터' },
  lighting: { label: 'LIGHTING', sub: '조명' },
  bedding: { label: 'BEDDING', sub: '침구' },
  furniture: { label: 'FURNITURE', sub: '가구와 테이블' },
  cooking: { label: 'COOKING', sub: '조리' },
  fire: { label: 'FIRE', sub: '화로' },
  heating: { label: 'HEATING', sub: '난방' },
  electronics: { label: 'ELECTRONICS', sub: '전자기기' },
  electrical: { label: 'ELECTRICAL', sub: '전기' },
  personal: { label: 'PERSONAL', sub: '개인용품' },
  hygiene: { label: 'HYGIENE', sub: '위생' },
  container: { label: 'CONTAINER', sub: '수납 박스' },
}

const SPACE_BADGE = {
  frunk: { label: '프렁크', cls: 'border-[#8fb6da] bg-[#eef6ff] text-[#1d4f7a]' },
  trunk: { label: '트렁크', cls: 'border-[#8ab899] bg-[#edf8f1] text-[#2d6b43]' },
  trunk_under: { label: '지하실', cls: 'border-[#d3b462] bg-[#fff7dc] text-[#815f13]' },
  cabin: { label: '실내', cls: 'border-[#c9a1a1] bg-[#fff1f1] text-[#884b4b]' },
}

const CATEGORY_ORDER = [
  'shelter',
  'tent',
  'bedding',
  'furniture',
  'cooking',
  'fire',
  'heating',
  'lighting',
  'electronics',
  'electrical',
  'hygiene',
  'personal',
  'container',
]

function groupByCategory(items) {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})
}

function getSortedCategories(grouped) {
  return [
    ...CATEGORY_ORDER.filter(category => grouped[category]),
    ...Object.keys(grouped).filter(category => !CATEGORY_ORDER.includes(category)),
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
      onClick={event => event.stopPropagation()}
      onChange={event => onAssignContainer(item.id, event.target.value)}
      aria-label="수납 여부"
      title="수납 여부"
      className="w-24 rounded border border-[#cfd5c7] bg-white px-1.5 py-1 text-xs text-stone-600 outline-none transition focus:border-[#506036]"
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
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      {badge && (
        <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
      )}
      <span className={`text-[10px] font-semibold ${isDefault ? 'text-[#6c7a47]' : 'text-stone-400'}`}>
        {isDefault ? '기본 추천' : '수동 추가'}
      </span>
      {container && (
        <span className="text-[10px] font-semibold text-stone-500">
          수납: {container.name}
        </span>
      )}
    </div>
  )
}

function ActiveItemRow({
  item,
  packed,
  isDefault,
  containers,
  containersById,
  showContainerSelect,
  onTogglePacked,
  onToggleSelected,
  onAssignContainer,
}) {
  return (
    <li className="border-b border-[#e1e4dc] py-2 last:border-b-0">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onTogglePacked(item.id)}
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition ${
            packed
              ? 'border-[#506036] bg-[#506036] text-white'
              : 'border-[#1f241b] bg-white text-transparent hover:border-[#506036]'
          }`}
          aria-label={packed ? '체크 해제' : '체크 완료'}
        >
          ✓
        </button>

        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => onTogglePacked(item.id)} className="block max-w-full text-left">
            <span
              className={`block text-sm leading-snug ${
                packed
                  ? 'text-stone-500 line-through decoration-[#506036] decoration-2'
                  : 'font-semibold text-[#262820]'
              }`}
            >
              {item.name}
            </span>
          </button>
          <ItemMeta item={item} isDefault={isDefault} containersById={containersById} />
          {item.notes && !packed && (
            <p className="mt-1 text-xs leading-snug text-stone-500">{item.notes}</p>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
          {showContainerSelect && (
            <ContainerSelect item={item} containers={containers} onAssignContainer={onAssignContainer} />
          )}
          <button
            type="button"
            onClick={() => onToggleSelected(item.id)}
            className="rounded border border-[#d4d9ce] bg-white px-2 py-1 text-xs font-semibold text-stone-500 transition hover:border-[#506036] hover:text-[#506036]"
          >
            빼기
          </button>
        </div>
      </div>
    </li>
  )
}

function InactiveItemRow({
  item,
  isDefault,
  containers,
  containersById,
  showContainerSelect,
  onToggleSelected,
  onAssignContainer,
}) {
  return (
    <li className="border-b border-[#e0e0dc] py-2 opacity-65 last:border-b-0 hover:opacity-100">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onToggleSelected(item.id)}
          className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-stone-400 bg-white text-xs font-bold text-stone-500 transition hover:border-[#506036] hover:text-[#506036]"
          aria-label="활성 아이템에 추가"
        >
          +
        </button>
        <div className="min-w-0 flex-1">
          <span className="block text-sm leading-snug text-stone-600">{item.name}</span>
          <ItemMeta item={item} isDefault={isDefault} containersById={containersById} />
          {item.notes && (
            <p className="mt-1 text-xs leading-snug text-stone-400">{item.notes}</p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
          {showContainerSelect && (
            <ContainerSelect item={item} containers={containers} onAssignContainer={onAssignContainer} />
          )}
          <button
            type="button"
            onClick={() => onToggleSelected(item.id)}
            className="rounded border border-[#506036] bg-[#506036] px-2 py-1 text-xs font-semibold text-white transition hover:bg-[#40502a]"
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
  const meta = CATEGORY_META[category] || { label: category.toUpperCase(), sub: category }

  return (
    <section className="border-t border-[#cfd5c7] pt-3 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={() => setCollapsed(value => !value)}
        className="mb-1 flex w-full items-baseline gap-2 text-left"
      >
        <span
          className="text-xl font-bold leading-none text-[#506036]"
          style={{ fontFamily: "'Gaegu', 'Noto Sans KR', system-ui, sans-serif" }}
        >
          {meta.label}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-stone-500">{meta.sub}</span>
        <span className="rounded border border-[#d4d9ce] bg-white px-1.5 py-0.5 text-[11px] font-bold text-stone-500">
          {items.length}
        </span>
        <span className="text-xs text-stone-500">{collapsed ? '펼치기' : '접기'}</span>
      </button>
      {!collapsed && (
        <ul>{items.map(renderItem)}</ul>
      )}
    </section>
  )
}

function ItemColumn({
  title,
  description,
  items,
  query,
  onQueryChange,
  renderItem,
  active,
}) {
  const filteredItems = useMemo(
    () => items.filter(item => matchesSearch(item, query)),
    [items, query],
  )
  const grouped = groupByCategory(filteredItems)
  const sortedCategories = getSortedCategories(grouped)

  return (
    <section className={active ? '' : 'opacity-70'}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className={active ? 'paper-section-title' : 'paper-section-title text-stone-500'}>
            {title}
          </h3>
          <p className="mt-1 text-xs text-stone-500">{description}</p>
        </div>
        <span className={`rounded border px-2 py-1 text-xs font-bold ${
          active
            ? 'border-[#506036] bg-[#506036] text-white'
            : 'border-stone-300 bg-white text-stone-500'
        }`}>
          {filteredItems.length}/{items.length}
        </span>
      </div>

      <input
        value={query}
        onChange={event => onQueryChange(event.target.value)}
        placeholder="아이템 검색"
        className="mb-4 w-full rounded border border-[#cfd5c7] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#506036]"
      />

      {filteredItems.length === 0 ? (
        <p className="rounded border border-dashed border-stone-300 bg-white/70 py-6 text-center text-sm text-stone-400">
          검색 결과가 없습니다.
        </p>
      ) : (
        <div className={active ? 'grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2' : 'grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2'}>
          {sortedCategories.map(category => (
            <CategorySection
              key={category}
              category={category}
              items={grouped[category]}
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
  const unassignedCount = selectedItems.filter(item => item.category !== 'container' && !item.storage_primary).length
  const openContainer = containers.find(container => container.id === openContainerId)
  const openItems = openContainer
    ? assignedItems.filter(item => item.storage_primary === openContainer.id)
    : []

  return (
    <section className="rounded border border-[#cfd5c7] bg-[#f3f6ed]/80 p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="paper-section-title">Primary Storage</h3>
          <p className="mt-1 text-xs text-stone-500">박스를 누르면 안에 들어간 아이템을 펼쳐봅니다.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded border border-[#cfd5c7] bg-white px-2 py-1 text-stone-600">지정 {assignedItems.length}개</span>
          <span className="rounded border border-[#cfd5c7] bg-white px-2 py-1 text-stone-600">미수납 {unassignedCount}개</span>
        </div>
      </div>

      {containers.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
          {containers.map(container => {
            const count = assignedItems.filter(item => item.storage_primary === container.id).length
            const open = openContainerId === container.id
            return (
              <button
                key={container.id}
                type="button"
                onClick={() => setOpenContainerId(open ? null : container.id)}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  open
                    ? 'border-[#506036] bg-white text-[#262820] shadow-sm'
                    : 'border-[#d4d9ce] bg-white/70 text-stone-600 hover:border-[#506036]'
                }`}
              >
                <span className="block truncate text-xs font-bold">{container.name}</span>
                <span className="text-[11px] text-stone-500">{count}개 수납</span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="mt-3 rounded border border-dashed border-[#cfd5c7] bg-white/70 px-3 py-3 text-sm text-stone-500">
          활성 체크리스트에 수납 박스가 없습니다.
        </p>
      )}

      {openContainer && (
        <div className="mt-3 rounded-lg border border-[#d4d9ce] bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#262820]">{openContainer.name}</p>
            <span className="text-xs text-stone-500">{openItems.length}개</span>
          </div>
          {openItems.length === 0 ? (
            <p className="text-sm text-stone-400">아직 수납된 아이템이 없습니다.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
              {openItems.map(item => (
                <li key={item.id} className="truncate text-sm text-stone-700">
                  ○ {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

function ChecklistModelYMark() {
  return (
    <div className="checklist-model-y-mark" aria-hidden="true">
      <img src="/model-y-checklist.png" alt="" />
      <span>Model Y</span>
    </div>
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
  presetLabel = '',
}) {
  const [activeQuery, setActiveQuery] = useState('')
  const [inactiveQuery, setInactiveQuery] = useState('')
  const [showContainerSelect, setShowContainerSelect] = useState(false)

  const containersById = useMemo(
    () => items
      .filter(item => item.category === 'container')
      .reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    [items],
  )
  const activeContainers = useMemo(
    () => items.filter(item => item.category === 'container' && selectedIds.has(item.id)),
    [items, selectedIds],
  )
  const activeItems = useMemo(
    () => items.filter(item => selectedIds.has(item.id)),
    [items, selectedIds],
  )
  const inactiveItems = useMemo(
    () => items.filter(item => !selectedIds.has(item.id)),
    [items, selectedIds],
  )
  const defaultRemovedCount = inactiveItems.filter(item => matchedIds.has(item.id)).length

  return (
    <section className="paper-sheet relative overflow-hidden">
      <div className="paper-ground" />
      <div className="mb-5 text-center">
        <h2 className="paper-title">CampslaY</h2>
        <ChecklistModelYMark />
        <p className="paper-subtitle">PACKING CHECKLIST · {presetLabel}</p>
        <p className="mt-2 text-sm text-stone-500">
          완료 {packedIds.size}/{activeItems.length} · 활성 {activeItems.length}개 · 비활성 {inactiveItems.length}개
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {packedIds.size > 0 && (
          <button
            type="button"
            onClick={onResetPacked}
            className="rounded border border-[#d4d9ce] bg-white/80 px-3 py-2 text-xs font-semibold text-stone-600 transition hover:border-[#506036]"
          >
            체크 초기화
          </button>
        )}
        {activeItems.length > 0 && (
          <button
            type="button"
            onClick={onResetSelection}
            className="rounded border border-[#d4d9ce] bg-white/80 px-3 py-2 text-xs font-semibold text-stone-600 transition hover:border-[#506036]"
          >
            활성 비우기
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowContainerSelect(value => !value)}
          className={`rounded border px-3 py-2 text-xs font-bold transition ${
            showContainerSelect
              ? 'border-[#506036] bg-[#506036] text-white'
              : 'border-[#d4d9ce] bg-white/80 text-stone-600 hover:border-[#506036]'
          }`}
        >
          수납 여부
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded border border-dashed border-[#cfd5c7] bg-white px-3 py-8 text-center text-sm text-stone-500">
          조건에 맞는 아이템이 없습니다.
        </p>
      ) : (
        <div className="space-y-6">
          <ContainerSummary items={items} selectedIds={selectedIds} />
          <ItemColumn
            title="챙길 것"
            description="체크하면 적재 도식에서도 줄 처리됩니다."
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
          <div className="paper-rule" />
          <ItemColumn
            title="대기 목록"
            description={`필요하면 다시 추가합니다. 기본에서 빠진 항목 ${defaultRemovedCount}개`}
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
          <PaperIllustrationSlot
            title="Nature camper sticker"
            description="Nature Camper 일러스트"
            imageUrl="/nature-camper.png"
            align="right"
          />
        </div>
      )}
    </section>
  )
}
