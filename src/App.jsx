import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import InputPanel from './components/InputPanel'
import CarVisualizer from './components/CarVisualizer'
import PackingResult from './components/PackingResult'
import RecipeResult from './components/RecipeResult'
import AddItemModal from './components/AddItemModal'
import { useItems } from './hooks/useItems'
import { usePackingFilter } from './hooks/usePackingFilter'
import { addItem } from './lib/api'

const DEFAULT_INPUT = {
  tent: 'edoshell',
  nights: 1,
  season: 'spring_fall',
  heater: false,
  igt: 'none',
  people: 1,
}

export default function App() {
  const [input, setInput] = useState(DEFAULT_INPUT)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: items, isLoading, isError } = useItems()
  const matchedIds = usePackingFilter(items, input)
  const queryClient = useQueryClient()

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
            <span className="text-stone-400 text-sm">Tesla Model Y 2025 Juniper 캠핑 패킹 어시스턴트</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-white font-medium"
          >
            + 아이템 추가
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-4">
        <InputPanel input={input} onChange={setInput} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <CarVisualizer items={items ?? []} matchedIds={matchedIds} input={input} />
          <PackingResult items={items ?? []} matchedIds={matchedIds} />
          <RecipeResult input={input} />
        </div>

        <footer className="text-center text-xs text-stone-400 pb-4">
          총 {items.length}개 아이템 · {input.tent === 'edoshell' ? '에도쉘 솔캠' : '스테고 가족캠핑'} ·{' '}
          {input.season === 'spring_fall' ? '봄/가을' : '겨울'} ·{' '}
          {input.nights === 0 ? '당일' : `${input.nights}박`} · {input.people}명 · 매칭 {matchedIds.size}개
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
    </div>
  )
}
