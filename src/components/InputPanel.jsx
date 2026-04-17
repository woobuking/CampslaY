const TENT_OPTIONS = [
  { value: 'edoshell', label: '에도쉘', sub: '솔캠' },
  { value: 'stego', label: '스테고', sub: '가족캠핑' },
]

const NIGHTS_OPTIONS = [
  { value: 0, label: '당일' },
  { value: 1, label: '1박' },
  { value: 2, label: '2박' },
]

const SEASON_OPTIONS = [
  { value: 'spring_fall', label: '봄/가을' },
  { value: 'winter', label: '겨울' },
]

const IGT_OPTIONS = [
  { value: 'none', label: 'IGT 없음' },
  { value: 'basic', label: 'Basic', sub: '메인+탑' },
  { value: 'full', label: 'Full', sub: '더블랙+언더쉘프' },
]

function ToggleGroup({ options, value, onChange, valueKey = 'value' }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map(opt => (
        <button
          key={opt[valueKey]}
          onClick={() => onChange(opt[valueKey])}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
            ${value === opt[valueKey]
              ? 'bg-stone-800 text-white border-stone-800'
              : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'
            }`}
        >
          {opt.label}
          {opt.sub && <span className="ml-1 text-xs opacity-70">({opt.sub})</span>}
        </button>
      ))}
    </div>
  )
}

function InputRow({ label, children }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-semibold text-stone-600 w-16 shrink-0">{label}</span>
      {children}
    </div>
  )
}

export default function InputPanel({ input, onChange }) {
  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }))

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
      <h2 className="font-bold text-base text-stone-800 mb-4">캠핑 조건 설정</h2>
      <div className="space-y-3">
        <InputRow label="텐트">
          <ToggleGroup options={TENT_OPTIONS} value={input.tent} onChange={v => set('tent', v)} />
        </InputRow>

        <InputRow label="기간">
          <ToggleGroup options={NIGHTS_OPTIONS} value={input.nights} onChange={v => set('nights', v)} />
        </InputRow>

        <InputRow label="계절">
          <ToggleGroup options={SEASON_OPTIONS} value={input.season} onChange={v => set('season', v)} />
        </InputRow>

        <InputRow label="난로">
          <button
            onClick={() => set('heater', !input.heater)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
              ${input.heater
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'
              }`}
          >
            {input.heater ? '난로 ON' : '난로 OFF'}
          </button>
        </InputRow>

        <InputRow label="IGT">
          <ToggleGroup options={IGT_OPTIONS} value={input.igt} onChange={v => set('igt', v)} />
        </InputRow>

        <InputRow label="인원">
          <div className="flex items-center gap-2">
            <button
              onClick={() => set('people', Math.max(1, input.people - 1))}
              className="w-8 h-8 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 font-bold"
            >−</button>
            <span className="text-sm font-bold text-stone-800 w-8 text-center">{input.people}명</span>
            <button
              onClick={() => set('people', Math.min(6, input.people + 1))}
              className="w-8 h-8 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 font-bold"
            >+</button>
          </div>
        </InputRow>
      </div>
    </div>
  )
}
