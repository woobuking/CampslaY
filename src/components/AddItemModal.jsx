import { useState, useEffect } from 'react'

const CATEGORY_PREFIX = {
  shelter:     'S',
  lighting:    'L',
  bedding:     'B',
  furniture:   'F',
  cooking:     'C',
  fire:        'FR',
  heating:     'H',
  electronics: 'E',
  electrical:  'E',
  personal:    'P',
  hygiene:     'HY',
  container:   'BOX',
}

const CATEGORIES = [
  'shelter', 'lighting', 'bedding', 'furniture', 'cooking',
  'fire', 'heating', 'electronics', 'electrical', 'personal', 'hygiene', 'container',
]

function generateId(category, existingItems) {
  const prefix = CATEGORY_PREFIX[category] ?? category.toUpperCase().slice(0, 3)
  const nums = existingItems
    .map(i => i.id)
    .filter(id => id.startsWith(prefix))
    .map(id => parseInt(id.replace(prefix, ''), 10))
    .filter(n => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

const DEFAULTS = {
  name: '',
  category: 'cooking',
  storage_secondary: 'trunk',
  required: 'TRUE',
  notes: '',
  tent: 'both',
  season: 'all',
  heater: '',
  igt: '',
  nights_min: '0',
}

export default function AddItemModal({ onClose, onSubmit, isSubmitting, existingItems = [] }) {
  const [form, setForm] = useState(DEFAULTS)
  const [autoId, setAutoId] = useState('')

  useEffect(() => {
    setAutoId(generateId(form.category, existingItems))
  }, [form.category, existingItems])

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = e => {
    e.preventDefault()
    if (!autoId || !form.name) return
    onSubmit({ ...form, id: autoId, people_min: '1' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-bold text-stone-800">아이템 추가</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="ID (자동)">
              <div className={`${input} bg-stone-50 text-stone-400`}>{autoId}</div>
            </Field>
            <Field label="이름 *">
              <input className={input} value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="아이템 이름" autoFocus />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="카테고리">
              <select className={input} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="적재 공간">
              <select className={input} value={form.storage_secondary} onChange={e => set('storage_secondary', e.target.value)}>
                <option value="frunk">프렁크</option>
                <option value="trunk">트렁크</option>
                <option value="trunk_under">지하실</option>
                <option value="cabin">뒷좌석</option>
              </select>
            </Field>
          </div>

          <div className="border-t border-stone-100 pt-3">
            <p className="text-xs font-semibold text-stone-500 mb-2">조건</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="텐트">
                <select className={input} value={form.tent} onChange={e => set('tent', e.target.value)}>
                  <option value="both">공통 (both)</option>
                  <option value="edoshell">에도쉘 솔캠</option>
                  <option value="stego">스테고/돔 가족캠</option>
                  <option value="dome_tarp">돔+타프</option>
                  <option value="dome_edoshell">돔+에도쉘</option>
                </select>
              </Field>
              <Field label="계절">
                <select className={input} value={form.season} onChange={e => set('season', e.target.value)}>
                  <option value="all">전체 (all)</option>
                  <option value="spring_fall">봄/가을</option>
                  <option value="summer">여름</option>
                  <option value="winter">겨울</option>
                </select>
              </Field>
              <Field label="난로">
                <select className={input} value={form.heater} onChange={e => set('heater', e.target.value)}>
                  <option value="">무관</option>
                  <option value="TRUE">필요</option>
                </select>
              </Field>
              <Field label="IGT">
                <select className={input} value={form.igt} onChange={e => set('igt', e.target.value)}>
                  <option value="">무관</option>
                  <option value="none">없음</option>
                  <option value="basic">basic</option>
                  <option value="full">full</option>
                  <option value="basic_full">basic 이상</option>
                </select>
              </Field>
              <Field label="최소 박수">
                <select className={input} value={form.nights_min} onChange={e => set('nights_min', e.target.value)}>
                  <option value="0">당일치기 이상</option>
                  <option value="1">1박 이상</option>
                </select>
              </Field>
              <Field label="필수 여부">
                <select className={input} value={form.required} onChange={e => set('required', e.target.value)}>
                  <option value="TRUE">필수</option>
                  <option value="">선택</option>
                </select>
              </Field>
            </div>
          </div>

          <Field label="메모">
            <input className={input} value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="적재 위치, 설명 등" />
          </Field>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:bg-stone-50">
              취소
            </button>
            <button type="submit" disabled={isSubmitting || !form.name}
              className="flex-1 py-2 rounded-lg bg-stone-800 text-white text-sm font-semibold hover:bg-stone-700 disabled:opacity-40">
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-stone-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

const input = 'w-full text-sm border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-stone-400'
