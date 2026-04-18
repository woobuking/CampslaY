import { useMemo, useState } from 'react'
import { PRESETS } from '../lib/presets'

const CATEGORY_PREFIX = {
  shelter: 'S',
  tent: 'S',
  lighting: 'L',
  bedding: 'B',
  furniture: 'F',
  cooking: 'C',
  fire: 'FR',
  heating: 'H',
  electronics: 'E',
  electrical: 'E',
  personal: 'P',
  hygiene: 'HY',
  container: 'BOX',
}

const CATEGORY_LABEL = {
  shelter: '쉘터',
  lighting: '조명',
  bedding: '침구',
  furniture: '가구/테이블',
  cooking: '조리',
  fire: '화로',
  heating: '난방',
  electronics: '전자기기',
  electrical: '전기',
  personal: '개인용품',
  hygiene: '위생',
  container: '수납 박스',
}

const CATEGORIES = [
  'shelter',
  'lighting',
  'bedding',
  'furniture',
  'cooking',
  'fire',
  'heating',
  'electronics',
  'electrical',
  'personal',
  'hygiene',
  'container',
]

const PRESET_TITLE = {
  P01: '에도쉘 캠프닉',
  P02: '에도쉘 1박',
  P03: '스테고 Basic',
  P04: '스테고 Full',
  P05: '스테고 겨울',
  P06: '돔+타프 Basic',
  P07: '돔+타프 Full',
  P08: '돔+에도쉘 Basic',
  P09: '돔+에도쉘 Full',
}

const SEASON_LABEL = {
  spring_fall: '봄/가을',
  summer: '여름',
  winter: '겨울',
}

function generateId(category, existingItems) {
  const prefix = CATEGORY_PREFIX[category] ?? category.toUpperCase().slice(0, 3)
  const nums = existingItems
    .map(item => item.id)
    .filter(id => id.startsWith(prefix))
    .map(id => parseInt(id.replace(prefix, ''), 10))
    .filter(n => !Number.isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

const DEFAULTS = {
  name: '',
  category: 'cooking',
  storage_primary: '',
  storage_secondary: 'trunk',
  required: 'TRUE',
  notes: '',
  presets: [],
  season: 'all',
  heater: '',
  igt: '',
  nights_min: '0',
}

export default function AddItemModal({ onClose, onSubmit, isSubmitting, existingItems = [] }) {
  const [form, setForm] = useState(DEFAULTS)
  const containerOptions = useMemo(
    () => existingItems.filter(item => item.category === 'container'),
    [existingItems],
  )
  const autoId = useMemo(
    () => generateId(form.category, existingItems),
    [form.category, existingItems],
  )

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const togglePreset = presetId => {
    setForm(prev => ({
      ...prev,
      presets: prev.presets.includes(presetId)
        ? prev.presets.filter(id => id !== presetId)
        : [...prev.presets, presetId],
    }))
  }

  const handleSubmit = event => {
    event.preventDefault()
    if (!autoId || !form.name || form.presets.length === 0) return
    onSubmit({ ...form, id: autoId, presets: JSON.stringify(form.presets), people_min: '1' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[#b7beb0] bg-[#f8faf7] shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#d7dccf] px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#6c7a47]">New item</p>
            <h2
              className="text-2xl font-bold leading-none text-[#506036]"
              style={{ fontFamily: "'Gaegu', 'Noto Sans KR', system-ui, sans-serif" }}
            >
              아이템 추가
            </h2>
          </div>
          <button onClick={onClose} className="rounded border border-[#d4d9ce] bg-white px-2 py-1 text-sm text-stone-600 hover:border-[#506036]">
            닫기
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="ID 자동 생성">
              <div className={`${fieldClass} bg-white/70 text-stone-500`}>{autoId}</div>
            </Field>
            <Field label="아이템 이름">
              <input
                className={fieldClass}
                value={form.name}
                onChange={event => set('name', event.target.value)}
                placeholder="예: 이너프 7"
                autoFocus
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="카테고리">
              <select className={fieldClass} value={form.category} onChange={event => set('category', event.target.value)}>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {CATEGORY_LABEL[category]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="적재 공간">
              <select className={fieldClass} value={form.storage_secondary} onChange={event => set('storage_secondary', event.target.value)}>
                <option value="frunk">프렁크</option>
                <option value="trunk">트렁크</option>
                <option value="trunk_under">지하실</option>
                <option value="cabin">실내</option>
              </select>
            </Field>
          </div>

          <Field label="수납 여부">
            <select className={fieldClass} value={form.storage_primary} onChange={event => set('storage_primary', event.target.value)}>
              <option value="">미수납</option>
              {containerOptions.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>

          <section className="rounded-lg border border-[#d4d9ce] bg-white/70 p-3">
            <p className="mb-2 text-sm font-bold text-[#506036]">포함 프리셋</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRESETS.map(preset => {
                const selected = form.presets.includes(preset.id)
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => togglePreset(preset.id)}
                    className={`rounded-lg border px-2 py-2 text-left text-xs transition ${
                      selected
                        ? 'border-[#506036] bg-[#506036] text-white'
                        : 'border-[#d4d9ce] bg-white text-stone-600 hover:border-[#506036]'
                    }`}
                  >
                    <span className="font-bold">{preset.id}</span>
                    <span className="ml-1">{PRESET_TITLE[preset.id] ?? preset.id}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="계절">
              <select className={fieldClass} value={form.season} onChange={event => set('season', event.target.value)}>
                <option value="all">전체</option>
                <option value="spring_fall">{SEASON_LABEL.spring_fall}</option>
                <option value="summer">{SEASON_LABEL.summer}</option>
                <option value="winter">{SEASON_LABEL.winter}</option>
              </select>
            </Field>
            <Field label="난로">
              <select className={fieldClass} value={form.heater} onChange={event => set('heater', event.target.value)}>
                <option value="">무관</option>
                <option value="TRUE">필요</option>
              </select>
            </Field>
            <Field label="IGT">
              <select className={fieldClass} value={form.igt} onChange={event => set('igt', event.target.value)}>
                <option value="">무관</option>
                <option value="none">없음</option>
                <option value="basic">basic</option>
                <option value="full">full</option>
                <option value="basic_full">basic 이상</option>
              </select>
            </Field>
            <Field label="최소 박수">
              <select className={fieldClass} value={form.nights_min} onChange={event => set('nights_min', event.target.value)}>
                <option value="0">당일 이상</option>
                <option value="1">1박 이상</option>
              </select>
            </Field>
            <Field label="필수 여부">
              <select className={fieldClass} value={form.required} onChange={event => set('required', event.target.value)}>
                <option value="TRUE">필수</option>
                <option value="">선택</option>
              </select>
            </Field>
          </div>

          <Field label="메모">
            <input
              className={fieldClass}
              value={form.notes}
              onChange={event => set('notes', event.target.value)}
              placeholder="적재 위치, 설명 등"
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#d4d9ce] bg-white py-2 text-sm font-semibold text-stone-600 hover:border-[#506036]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.name || form.presets.length === 0}
              className="flex-1 rounded-lg border border-[#506036] bg-[#506036] py-2 text-sm font-semibold text-white hover:bg-[#40502a] disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-300"
            >
              {isSubmitting ? '저장 중' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-stone-500">{label}</span>
      {children}
    </label>
  )
}

const fieldClass = 'w-full rounded border border-[#cfd5c7] bg-white px-3 py-2 text-sm text-stone-700 outline-none transition focus:border-[#506036]'
