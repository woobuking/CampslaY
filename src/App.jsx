import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import InputPanel from './components/InputPanel'
import CarVisualizer from './components/CarVisualizer'
import PackingResult from './components/PackingResult'
import RecipeResult from './components/RecipeResult'
import AddItemModal from './components/AddItemModal'
import SavePresetModal from './components/SavePresetModal'
import PresetLoader from './components/PresetLoader'
import { useItems } from './hooks/useItems'
import { usePackingFilter } from './hooks/usePackingFilter'
import { addItem, savePreset } from './lib/api'
import { findPreset } from './lib/presets'

const TENT_LABEL = { edoshell: '에도쉘 솔캠', stego: '스테고', dome_tarp: '돔+타프', dome_edoshell: '돔+에도쉘' }
const SEASON_LABEL = { spring_fall: '봄/가을', summer: '여름', winter: '겨울' }

const DEFAULT_INPUT = {
  tent: 'edoshell',
  nights: 0,
  season: 'spring_fall',
  heater: false,
  igt: 'none',
}

export default function App() {
  const [input, setInput] = useState(DEFAULT_INPUT)
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { data: items, isLoading, isError } = useItems()
  const matchedIds = usePackingFilter(items, input)
  const queryClient = useQueryClient()

  const toggleItem = id => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const resetChecked = () => setCheckedIds(new Set())

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

  const handleSavePreset = async (name) => {
    setIsSaving(true)
    try {
      await savePreset(name, input, checkedIds)
      setShowSaveModal(false)
      await queryClient.invalidateQueries({ queryKey: ['presets'] })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadPreset = (preset) => {
    setInput(preset.input)
    setCheckedIds(new Set(preset.checked_ids))
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
            <PresetLoader onLoad={handleLoadPreset} />
            <button
              onClick={() => setShowSaveModal(true)}
              className="text-sm px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-white font-medium"
            >
              조건 저장
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
        <InputPanel input={input} onChange={setInput} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <CarVisualizer items={items ?? []} matchedIds={matchedIds} input={input} />
          <PackingResult
            items={items ?? []}
            matchedIds={matchedIds}
            checkedIds={checkedIds}
            onToggle={toggleItem}
            onReset={resetChecked}
          />
          <RecipeResult input={input} />
        </div>

        <footer className="text-center text-xs text-stone-400 pb-4">
          총 {items.length}개 아이템 · {findPreset(input)?.id ?? '커스텀'} ·{' '}
          {TENT_LABEL[input.tent] ?? input.tent} · {SEASON_LABEL[input.season]} ·{' '}
          {input.nights === 0 ? '당일' : '1박이상'} · 매칭 {matchedIds.size}개
        </footer>
      </main>

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddItem}
          isSubmitting={isSubmitting}
          existingItems={items ?? []}
        />
      )}

      {showSaveModal && (
        <SavePresetModal
          input={input}
          checkedIds={checkedIds}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSavePreset}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}
