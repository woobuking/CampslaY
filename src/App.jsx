import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import AddItemModal from './components/AddItemModal'
import SavePresetModal from './components/SavePresetModal'
import { useItems } from './hooks/useItems'
import { getPackingMatchedIds, usePackingFilter } from './hooks/usePackingFilter'
import { addItem, fetchPresets, savePreset, updateItemContainer } from './lib/api'
import { findPreset, getSavedPresetMap, normalizeInput, PRESETS } from './lib/presets'

const TENT_LABEL = {
  edoshell: 'Solo shell',
  stego: 'Family stego',
  dome_tarp: 'Dome tarp',
  dome_edoshell: 'Dome shell',
}

const SEASON_LABEL = {
  spring_fall: 'Spring/Fall',
  summer: 'Summer',
  winter: 'Winter',
}

const PRESET_TITLE = {
  P01: 'Solo day camp',
  P02: 'Solo overnight',
  P03: 'Stego basic',
  P04: 'Stego full',
  P05: 'Winter full',
  P06: 'Dome basic',
  P07: 'Dome full',
  P08: 'Dome shell basic',
  P09: 'Dome shell full',
}

const BOX_GROUP_PRIORITY = {
  BOX001: 0,
  BOX003: 1,
}

const CATEGORY_META = {
  shelter: { label: 'Tent', icon: '🏕️' },
  tent: { label: 'Tent', icon: '🏕️' },
  lighting: { label: 'Lighting', icon: '💡' },
  bedding: { label: 'Bedding', icon: '🛏️' },
  furniture: { label: 'Furniture', icon: '🚪' },
  cooking: { label: 'Cooking', icon: '🍳' },
  fire: { label: 'Fire', icon: '🔥' },
  heating: { label: 'Heating', icon: '♨️' },
  electronics: { label: 'Electronics', icon: '🔌' },
  electrical: { label: 'Electrical', icon: '⚡' },
  personal: { label: 'Personal', icon: '🎒' },
  hygiene: { label: 'Hygiene', icon: '🧼' },
  container: { label: 'Container', icon: '📦' },
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

const DEFAULT_INPUT = normalizeInput({
  tent: 'edoshell',
  nights: 0,
  season: 'spring_fall',
  heater: false,
  igt: 'none',
})

function toExistingCheckedSet(ids = [], itemIdSet = new Set()) {
  const source = Array.isArray(ids) ? ids : []
  return new Set(source.filter(id => itemIdSet.has(id)))
}

function getPresetTitle(preset, input) {
  if (preset?.id && PRESET_TITLE[preset.id]) return PRESET_TITLE[preset.id]
  return TENT_LABEL[input.tent] ?? input.tent
}

function pct(done, total) {
  if (!total) return 0
  return Math.round((done / total) * 100)
}

function compareBoxPriority(a, b) {
  return (BOX_GROUP_PRIORITY[a.id] ?? 99) - (BOX_GROUP_PRIORITY[b.id] ?? 99)
}

function EmojiIcon({ icon }) {
  return (
    <span className="emoji-icon" aria-hidden="true">
      {icon}
    </span>
  )
}

function Metric({ label, value, tone = 'light', icon = '✅' }) {
  return (
    <div className="app-metric">
      <span className="app-metric-label">
        <span className="metric-emoji" aria-hidden="true">{icon}</span>
        {label}
      </span>
      <strong className={tone === 'blue' ? 'is-blue' : ''}>{value}</strong>
    </div>
  )
}

function PresetPicker({ activePreset, savedPresetMap, onSelectPreset }) {
  return (
    <section className="preset-strip" aria-label="Packing presets">
      {PRESETS.map(preset => {
        const active = activePreset?.id === preset.id
        const saved = savedPresetMap[preset.id]
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset)}
            className={active ? 'is-active' : ''}
          >
            <span>{preset.id}</span>
            <strong>{PRESET_TITLE[preset.id] ?? preset.id}</strong>
            <small>{saved ? 'Saved' : `${SEASON_LABEL[preset.season]} setup`}</small>
          </button>
        )
      })}
    </section>
  )
}

function StorageSummary({ activeItems, packedIds, onTogglePacked }) {
  const [expandedZones, setExpandedZones] = useState(new Set())
  const zones = [
    { id: 'frunk', label: 'Frunk', tone: 'zone-frunk' },
    { id: 'cabin', label: 'Cabin', tone: 'zone-cabin' },
    { id: 'trunk', label: 'Trunk', tone: 'zone-trunk' },
    { id: 'trunk_under', label: 'Under Trunk', tone: 'zone-under' },
  ]

  const toggleZone = id => {
    setExpandedZones(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const containers = activeItems.filter(item => item.category === 'container')
  const containerMap = new Map(containers.map(container => [container.id, container]))

  const getItemZoneId = item => {
    if (item.storage_primary && containerMap.has(item.storage_primary)) {
      return containerMap.get(item.storage_primary).storage_secondary
    }
    return item.storage_secondary
  }

  const getZoneGroups = items => {
    const groups = []
    const seen = new Set()

    items
      .filter(item => item.category === 'container')
      .sort(compareBoxPriority)
      .forEach(container => {
        const childItems = items.filter(item => item.storage_primary === container.id && item.category !== 'container')
        groups.push({ type: 'box', container, items: childItems })
        seen.add(container.id)
        childItems.forEach(item => seen.add(item.id))
      })

    items
      .filter(item => item.storage_primary && containerMap.has(item.storage_primary) && !seen.has(item.id))
      .forEach(item => {
        const container = containerMap.get(item.storage_primary)
        let group = groups.find(candidate => candidate.type === 'box' && candidate.container.id === container.id)
        if (!group) {
          group = { type: 'box', container, items: [] }
          groups.push(group)
        }
        group.items.push(item)
        seen.add(item.id)
      })

    const looseItems = items.filter(item => !seen.has(item.id) && item.category !== 'container')
    if (looseItems.length > 0) groups.push({ type: 'loose', items: looseItems })
    return groups.sort((a, b) => {
      if (a.type === 'loose') return 1
      if (b.type === 'loose') return -1
      return compareBoxPriority(a.container, b.container)
    })
  }

  const getGroupRowCount = group => group.items.length + (group.type === 'box' ? 1 : 0)

  const getLimitedGroups = (groups, rowLimit) => {
    if (!rowLimit) {
      return {
        visibleGroups: groups,
        hiddenCount: 0,
      }
    }

    let remaining = rowLimit
    let visibleCount = 0
    const visibleGroups = []

    groups.forEach(group => {
      if (remaining <= 0) return

      if (group.type === 'box') {
        remaining -= 1
        visibleCount += 1
        const visibleItems = group.items.slice(0, Math.max(remaining, 0))
        remaining -= visibleItems.length
        visibleCount += visibleItems.length
        visibleGroups.push({ ...group, items: visibleItems })
        return
      }

      const visibleItems = group.items.slice(0, remaining)
      remaining -= visibleItems.length
      visibleCount += visibleItems.length
      if (visibleItems.length > 0) visibleGroups.push({ ...group, items: visibleItems })
    })

    const totalCount = groups.reduce((sum, group) => sum + getGroupRowCount(group), 0)
    return {
      visibleGroups,
      hiddenCount: Math.max(totalCount - visibleCount, 0),
    }
  }

  return (
    <section className="summary-card" aria-label="Storage summary">
      <div className="summary-left">
        <h2>Storage Load Map</h2>
      </div>
      <div className="zone-list">
        {zones.map(zone => {
          const items = activeItems.filter(item => getItemZoneId(item) === zone.id)
          const done = items.filter(item => packedIds.has(item.id)).length
          const expanded = expandedZones.has(zone.id)
          const groups = getZoneGroups(items)
          const trunkRowLimit = zone.id === 'trunk' && !expanded ? 14 : null
          const { visibleGroups, hiddenCount } = getLimitedGroups(groups, trunkRowLimit)
          const showZoneToggle = zone.id === 'trunk' && (expanded || hiddenCount > 0)
          return (
            <article className={`zone-checklist ${zone.tone}`} key={zone.id}>
              <header>
                <span>{zone.label}</span>
                <strong>{done}/{items.length}</strong>
              </header>
              {groups.length === 0 ? (
                <p className="zone-empty">No items</p>
              ) : (
                <div className="zone-groups">
                  {visibleGroups.map(group => (
                    group.type === 'box' ? (
                      <div className="zone-box-group" key={`box-${group.container.id}`}>
                        <button
                          type="button"
                          className={packedIds.has(group.container.id) ? 'zone-box-title is-packed' : 'zone-box-title'}
                          onClick={() => onTogglePacked(group.container.id)}
                        >
                          <span className="tiny-check" />
                          <strong>{group.container.name}</strong>
                        </button>
                        {group.items.length > 0 && (
                          <ul>
                            {group.items.map(item => (
                              <li className={packedIds.has(item.id) ? 'is-packed' : ''} key={item.id}>
                                <button type="button" onClick={() => onTogglePacked(item.id)}>
                                  <span className="tiny-check" />
                                  <span>{item.name}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div className="zone-box-group" key="loose-items">
                        {zone.id === 'trunk' && <p className="zone-loose-title">Loose items</p>}
                        <ul>
                          {group.items.map(item => (
                            <li className={packedIds.has(item.id) ? 'is-packed' : ''} key={item.id}>
                              <button type="button" onClick={() => onTogglePacked(item.id)}>
                                <span className="tiny-check" />
                                <span>{item.name}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  ))}
                  {showZoneToggle && (
                    <div className="zone-more">
                      <button type="button" onClick={() => toggleZone(zone.id)}>
                        {expanded ? '▴ Less' : `▾ ${hiddenCount} more`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function BoxStoragePanel({ activeItems, packedIds }) {
  const [openContainerId, setOpenContainerId] = useState(null)
  const containers = activeItems.filter(item => item.category === 'container')
  const assignedItems = activeItems.filter(item => item.category !== 'container' && item.storage_primary)
  const openContainer = containers.find(container => container.id === openContainerId)
  const openItems = openContainer
    ? assignedItems.filter(item => item.storage_primary === openContainer.id)
    : []

  if (containers.length === 0) {
    return (
      <section className="box-storage-panel" aria-label="Storage boxes">
        <div className="box-storage-title">
          <h2>Storage Boxes</h2>
          <span>0</span>
        </div>
        <p className="box-storage-empty">No selected boxes yet.</p>
      </section>
    )
  }

  return (
    <section className="box-storage-panel" aria-label="Storage boxes">
      <div className="box-storage-title">
        <h2>Storage Boxes</h2>
        <span>{containers.length}</span>
      </div>
      <div className="box-grid">
        {containers.map(container => {
          const boxItems = assignedItems.filter(item => item.storage_primary === container.id)
          const packed = boxItems.filter(item => packedIds.has(item.id)).length
          const open = openContainerId === container.id
          return (
            <button
              className={open ? 'is-open' : ''}
              key={container.id}
              type="button"
              onClick={() => setOpenContainerId(open ? null : container.id)}
            >
              <strong>{container.name}</strong>
              <span>{packed}/{boxItems.length} packed</span>
            </button>
          )
        })}
      </div>

      {openContainer && (
        <div className="box-detail">
          <header>
            <strong>{openContainer.name}</strong>
            <span>{openItems.length} items</span>
          </header>
          {openItems.length === 0 ? (
            <p>No items assigned to this box.</p>
          ) : (
            <ul>
              {openItems.map(item => (
                <li className={packedIds.has(item.id) ? 'is-packed' : ''} key={item.id}>
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

function groupItemsByCategory(items) {
  return items.reduce((acc, item) => {
    const category = item.category || 'uncategorized'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})
}

function sortedCategories(grouped) {
  return [
    ...CATEGORY_ORDER.filter(category => grouped[category]),
    ...Object.keys(grouped).filter(category => !CATEGORY_ORDER.includes(category)),
  ]
}

function ChecklistRow({
  item,
  selected,
  packed,
  isDefault,
  onToggleSelected,
  onTogglePacked,
}) {
  const meta = CATEGORY_META[item.category] ?? { label: item.category || 'Item', icon: '📦' }

  return (
    <article className={`check-row ${packed ? 'is-packed' : ''}`}>
      <button
        type="button"
        className={`check-row-icon ${selected ? 'is-selected' : ''}`}
        onClick={() => selected ? onTogglePacked(item.id) : onToggleSelected(item.id)}
        aria-label={selected ? 'Toggle packed' : 'Add item'}
      >
        <EmojiIcon icon={meta.icon} />
      </button>

      <div className="check-row-main">
        <h3>{item.name}</h3>
        <p>{item.notes || item.id}</p>
      </div>

      <div className="row-separator" />
      <p className="row-type">{meta.label}</p>
      <div className="row-separator" />

      <button
        type="button"
        className={`row-action ${packed ? 'is-packed' : selected ? 'is-selected' : ''}`}
        onClick={() => selected ? onTogglePacked(item.id) : onToggleSelected(item.id)}
      >
        {packed ? 'Done' : selected ? 'Pack' : isDefault ? 'Add' : 'Pick'}
      </button>

    </article>
  )
}

function ChecklistView({
  view,
  items,
  selectedIds,
  packedIds,
  matchedIds,
  onToggleSelected,
  onTogglePacked,
}) {
  const [closedCategories, setClosedCategories] = useState(new Set())
  const grouped = groupItemsByCategory(items)
  const categories = sortedCategories(grouped)
  const toggleCategory = category => {
    setClosedCategories(prev => {
      const next = new Set(prev)
      next.has(category) ? next.delete(category) : next.add(category)
      return next
    })
  }

  return (
    <section className="check-list" aria-label="Checklist">
      {items.length === 0 ? (
        <p className="empty-list">No items in this view.</p>
      ) : (
        categories.map(category => {
          const meta = CATEGORY_META[category] ?? { label: category, icon: '📦' }
          const closed = closedCategories.has(category)
          return (
            <section className="category-section" key={`${view}-${category}`}>
              <button
                className={`category-header ${closed ? '' : 'is-open'}`}
                type="button"
                onClick={() => toggleCategory(category)}
                aria-expanded={!closed}
              >
                <span>{meta.icon}</span>
                <strong>{meta.label}</strong>
                <small>{grouped[category].length}</small>
                <em>{closed ? '▾' : '▴'}</em>
              </button>
              {!closed && (
                <div className="category-items">
                  {grouped[category].map(item => (
                    <ChecklistRow
                      key={`${view}-${item.id}`}
                      item={item}
                      selected={selectedIds.has(item.id)}
                      packed={packedIds.has(item.id)}
                      isDefault={matchedIds.has(item.id)}
                      onToggleSelected={onToggleSelected}
                      onTogglePacked={onTogglePacked}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })
      )}
    </section>
  )
}

export default function App() {
  const [input, setInput] = useState(DEFAULT_INPUT)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [packedIds, setPackedIds] = useState(new Set())
  const [containerOverrides, setContainerOverrides] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [view, setView] = useState('selected')
  const loadedPresetKeyRef = useRef(null)

  const { data: items = [], isLoading, isError } = useItems()
  const { data: savedPresets = [] } = useQuery({
    queryKey: ['presets'],
    queryFn: fetchPresets,
    staleTime: 1000 * 60,
  })
  const queryClient = useQueryClient()

  const itemsWithContainerOverrides = useMemo(
    () => items.map(item => (
      Object.prototype.hasOwnProperty.call(containerOverrides, item.id)
        ? { ...item, storage_primary: containerOverrides[item.id] }
        : item
    )),
    [items, containerOverrides],
  )
  const itemIdSet = useMemo(
    () => new Set(itemsWithContainerOverrides.map(item => item.id)),
    [itemsWithContainerOverrides],
  )
  const matchedIds = usePackingFilter(itemsWithContainerOverrides, input)
  const activePreset = findPreset(input)
  const activePresetLabel = getPresetTitle(activePreset, input)
  const savedPresetMap = useMemo(() => getSavedPresetMap(savedPresets), [savedPresets])
  const linkedSavedPreset = activePreset ? savedPresetMap[activePreset.id] : null
  const activeSelectedIds = useMemo(
    () => toExistingCheckedSet([...selectedIds], itemIdSet),
    [selectedIds, itemIdSet],
  )
  const activePackedIds = useMemo(
    () => new Set([...packedIds].filter(id => activeSelectedIds.has(id))),
    [packedIds, activeSelectedIds],
  )
  const activeItems = useMemo(
    () => itemsWithContainerOverrides.filter(item => activeSelectedIds.has(item.id)),
    [itemsWithContainerOverrides, activeSelectedIds],
  )
  const inactiveItems = useMemo(
    () => itemsWithContainerOverrides.filter(item => !activeSelectedIds.has(item.id)),
    [itemsWithContainerOverrides, activeSelectedIds],
  )
  const visibleItems = view === 'selected'
    ? activeItems
    : view === 'remaining'
      ? inactiveItems
      : itemsWithContainerOverrides
  const packedPercent = pct(activePackedIds.size, activeItems.length)

  useEffect(() => {
    if (!activePreset || itemsWithContainerOverrides.length === 0) return
    const presetKey = `${activePreset.id}:${linkedSavedPreset?.created_at ?? 'default'}:${itemsWithContainerOverrides.length}`
    if (loadedPresetKeyRef.current === presetKey) return

    const sourceIds = linkedSavedPreset?.checked_ids ?? [...matchedIds]
    setSelectedIds(toExistingCheckedSet(sourceIds, itemIdSet))
    setPackedIds(new Set())
    loadedPresetKeyRef.current = presetKey
  }, [activePreset, itemIdSet, itemsWithContainerOverrides.length, linkedSavedPreset, matchedIds])

  const toggleSelectedItem = id => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setPackedIds(prevPacked => {
          const nextPacked = new Set(prevPacked)
          nextPacked.delete(id)
          return nextPacked
        })
      } else {
        next.add(id)
      }
      return next
    })
  }

  const togglePackedItem = id => {
    if (!activeSelectedIds.has(id)) return
    setPackedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleAssignContainer = async (itemId, containerId) => {
    if (!itemIdSet.has(itemId) || itemId === containerId) return
    const storagePrimary = containerId || ''
    setContainerOverrides(prev => ({ ...prev, [itemId]: storagePrimary }))
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.add(itemId)
      if (storagePrimary) next.add(storagePrimary)
      return next
    })

    try {
      await updateItemContainer(itemId, storagePrimary)
      await queryClient.invalidateQueries({ queryKey: ['items'] })
    } catch (err) {
      console.warn(err)
    }
  }

  const handleAddItem = async form => {
    setIsSubmitting(true)
    try {
      await addItem(form)
      setShowAddModal(false)
      await queryClient.invalidateQueries({ queryKey: ['items'] })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectPreset = preset => {
    const normalized = normalizeInput(preset)
    const nextMatchedIds = getPackingMatchedIds(items, normalized)
    const savedPreset = savedPresetMap[preset.id]
    const nextPresetKey = `${preset.id}:${savedPreset?.created_at ?? 'default'}:${itemsWithContainerOverrides.length}`
    setInput(normalized)
    setSelectedIds(toExistingCheckedSet(savedPreset?.checked_ids ?? [...nextMatchedIds], itemIdSet))
    setPackedIds(new Set())
    setView('selected')
    loadedPresetKeyRef.current = nextPresetKey
  }

  const handleSavePreset = async () => {
    if (!activePreset) return
    setIsSaving(true)
    try {
      await savePreset(activePreset.id, input, activeSelectedIds)
      setSelectedIds(activeSelectedIds)
      setShowSaveModal(false)
      await queryClient.invalidateQueries({ queryKey: ['presets'] })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="state-screen">
        <p>Loading CampslaY checklist...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="state-screen">
        <p>Could not load checklist data. Check the API settings.</p>
      </div>
    )
  }

  return (
    <div className="finwise-shell">
      <main className="app-screen">
        <section className="hero-panel">
          <header className="home-header">
            <div>
              <h1>CampslaY</h1>
              <p>{activePresetLabel} / {SEASON_LABEL[input.season]}</p>
            </div>
            <div className="header-car-wrap" aria-hidden="true">
              <img className="header-car" src="/header-camp.png" alt="" />
            </div>
            <div className="header-actions">
              <button type="button" onClick={() => setShowAddModal(true)}>Add</button>
              <button type="button" onClick={() => setShowSaveModal(true)} disabled={!activePreset}>Save</button>
            </div>
          </header>

          <section className="metric-grid">
            <Metric label="Checklist" value={activeItems.length} />
            <div className="metric-divider" />
            <Metric label="Packed" value={activePackedIds.size} tone="blue" icon="🧳" />
          </section>

          <section className="progress-panel">
            <div className="progress-track" style={{ '--progress': `${packedPercent}%` }}>
              <div className="progress-fill" aria-hidden="true" />
              <span>{packedPercent}%</span>
              <strong>{activePackedIds.size}/{activeItems.length}</strong>
            </div>
          </section>
        </section>

        <section className="content-panel">
          <StorageSummary
            activeItems={activeItems}
            packedIds={activePackedIds}
            onTogglePacked={togglePackedItem}
          />

          <PresetPicker
            activePreset={activePreset}
            savedPresetMap={savedPresetMap}
            onSelectPreset={handleSelectPreset}
          />

          <nav className="period-tabs" aria-label="Checklist view">
            <button className={view === 'selected' ? 'is-active' : ''} onClick={() => setView('selected')}>Packing</button>
            <button className={view === 'remaining' ? 'is-active' : ''} onClick={() => setView('remaining')}>Reserve</button>
            <button className={view === 'all' ? 'is-active' : ''} onClick={() => setView('all')}>All</button>
          </nav>

          <ChecklistView
            view={view}
            items={visibleItems}
            selectedIds={activeSelectedIds}
            packedIds={activePackedIds}
            matchedIds={matchedIds}
            onToggleSelected={toggleSelectedItem}
            onTogglePacked={togglePackedItem}
          />
        </section>

      </main>

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddItem}
          isSubmitting={isSubmitting}
          existingItems={itemsWithContainerOverrides}
        />
      )}

      {showSaveModal && (
        <SavePresetModal
          input={input}
          checkedIds={activeSelectedIds}
          activePreset={activePreset}
          linkedSavedPreset={linkedSavedPreset}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSavePreset}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}
