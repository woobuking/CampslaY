import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import InputPanel from './components/InputPanel'
import CarVisualizer from './components/CarVisualizer'
import PackingResult from './components/PackingResult'
import RecipeResult from './components/RecipeResult'
import AddItemModal from './components/AddItemModal'
import SavePresetModal from './components/SavePresetModal'
import { useItems } from './hooks/useItems'
import { getPackingMatchedIds, usePackingFilter } from './hooks/usePackingFilter'
import { addItem, fetchPresets, savePreset, updateItemContainer } from './lib/api'
import { findPreset, getSavedPresetMap, normalizeInput } from './lib/presets'

const TENT_LABEL = { edoshell: '에도쉘 솔캠', stego: '스테고', dome_tarp: '돔+타프', dome_edoshell: '돔+에도쉘' }
const SEASON_LABEL = { spring_fall: '봄/가을', summer: '여름', winter: '겨울' }

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

export default function App() {
  const [input, setInput] = useState(DEFAULT_INPUT)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [packedIds, setPackedIds] = useState(new Set())
  const [containerOverrides, setContainerOverrides] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const loadedPresetKeyRef = useRef(null)

  const { data: items = [], isLoading, isError } = useItems()
  const { data: savedPresets = [] } = useQuery({
    queryKey: ['presets'],
    queryFn: fetchPresets,
    staleTime: 1000 * 60,
  })
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
  const queryClient = useQueryClient()
  const activePreset = findPreset(input)
  const activePresetLabel = activePreset?.label ?? TENT_LABEL[input.tent] ?? input.tent
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

  const resetPacked = () => setPackedIds(new Set())

  const resetSelection = () => {
    setSelectedIds(new Set())
    setPackedIds(new Set())
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

  const handleAddItem = async (form) => {
    setIsSubmitting(true)
    try {
      await addItem(form)
      setShowAddModal(false)
      await queryClient.invalidateQueries({ queryKey: ['items'] })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectPreset = (preset) => {
    const normalized = normalizeInput(preset)
    const nextMatchedIds = getPackingMatchedIds(items, normalized)
    const savedPreset = savedPresetMap[preset.id]
    const nextPresetKey = `${preset.id}:${savedPreset?.created_at ?? 'default'}:${itemsWithContainerOverrides.length}`
    setInput(normalized)
    setSelectedIds(toExistingCheckedSet(savedPreset?.checked_ids ?? [...nextMatchedIds], itemIdSet))
    setPackedIds(new Set())
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

  if (isLoading) return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center">
      <p className="text-stone-500 text-sm">아이템 불러오는 중...</p>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center">
      <p className="text-red-500 text-sm">데이터를 불러올 수 없습니다. API 설정을 확인해주세요.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold tracking-tight">CampslaY</h1>
            <span className="text-stone-400 text-sm hidden sm:inline">Tesla Model Y 2025 Juniper 캠핑 패킹 어시스턴트</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={!activePreset}
              className="text-sm px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-white font-medium"
            >
              {activePreset ? `${activePreset.id} 저장` : '조건 저장'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-sm px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-white font-medium"
            >
              + 아이템
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-4">
        <InputPanel
          input={input}
          onSelectPreset={handleSelectPreset}
          savedPresetMap={savedPresetMap}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          <CarVisualizer
            items={itemsWithContainerOverrides}
            selectedIds={activeSelectedIds}
            packedIds={activePackedIds}
            input={input}
          />
          <PackingResult
            items={itemsWithContainerOverrides}
            matchedIds={matchedIds}
            selectedIds={activeSelectedIds}
            packedIds={activePackedIds}
            onToggleSelected={toggleSelectedItem}
            onTogglePacked={togglePackedItem}
            onResetPacked={resetPacked}
            onResetSelection={resetSelection}
            onAssignContainer={handleAssignContainer}
          />
          <RecipeResult input={input} />
        </div>

        <footer className="text-center text-xs text-stone-400 pb-4">
          총 {itemsWithContainerOverrides.length}개 아이템 · {findPreset(input)?.id ?? '커스텀'} ·{' '}
          {activePresetLabel} · {SEASON_LABEL[input.season]} ·{' '}
          {input.nights === 0 ? '당일' : '1박이상'} · 기본 {matchedIds.size}개 · 활성 {activeSelectedIds.size}개 · 완료 {activePackedIds.size}개
        </footer>
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
