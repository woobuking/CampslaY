import { useState } from 'react'

const DEFAULTS = {
  id: '',
  name: '',
  category: 'cooking',
  storage_secondary: 'trunk',
  required: 'TRUE',
  purchase: '',
  notes: '',
  tent: 'both',
  season: 'all',
  heater: '',
  igt: '',
  people_min: '1',
  nights_min: '0',
}

const CATEGORIES = [
  'shelter', 'lighting', 'bedding', 'furniture', 'cooking',
  'fire', 'heating', 'electronics', 'electrical', 'personal', 'hygiene', 'container',
]

export default function AddItemModal({ onClose, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(DEFAULTS)

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.id || !form.name) return
    onSubmit(form)
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
            <Field label="ID *" required>
              <input className={input} value={form.id} onChange={e => set('id', e.target.value)}
                placeholder="예: C013" />
            </Field>
            <Field label="이름 *" required>
              <input className={input} value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="아이템 이름" />
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
                  <option value="edoshell">에도쉘</option>
                  <option value="stego">스테고</option>
                </select>
              </Field>
              <Field label="계절">
                <select className={input} value={form.season} onChange={e => set('season', e.target.value)}>
                  <option value="all">전체 (all)</option>
                  <option value="spring_fall">봄/가을</option>
                  <option value="winter">겨울</option>
                </select>
              </Field>
              <Field label="난로">
                <select className={input} value={form.heater} onChange={e => set('heater', e.target.value)}>
                  <option value="">무관 (null)</option>
                  <option value="TRUE">필요 (true)</option>
                </select>
              </Field>
              <Field label="IGT">
                <select className={input} value={form.igt} onChange={e => set('igt', e.target.value)}>
                  <option value="">무관 (null)</option>
                  <option value="none">없음</option>
                  <option value="basic">basic</option>
                  <option value="full">full</option>
                  <option value="basic_full">basic 이상</option>
                </select>
              </Field>
              <Field label="최소 인원">
                <input type="number" className={input} min="1" value={form.people_min}
                  onChange={e => set('people_min', e.target.value)} />
              </Field>
              <Field label="최소 박수">
                <input type="number" className={input} min="0" value={form.nights_min}
                  onChange={e => set('nights_min', e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="필수 여부">
              <select className={input} value={form.required} onChange={e => set('required', e.target.value)}>
                <option value="TRUE">필수</option>
                <option value="">선택</option>
              </select>
            </Field>
            <Field label="현장 구매">
              <select className={input} value={form.purchase} onChange={e => set('purchase', e.target.value)}>
                <option value="">아니오</option>
                <option value="TRUE">예</option>
              </select>
            </Field>
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
            <button type="submit" disabled={isSubmitting || !form.id || !form.name}
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
