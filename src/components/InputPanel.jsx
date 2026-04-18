import { PRESETS, findPreset } from '../lib/presets'

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

const TENT_LABEL = {
  edoshell: '에도쉘',
  stego: '스테고',
  dome_tarp: '돔텐트+타프',
  dome_edoshell: '돔텐트+에도쉘',
}

const SEASON_LABEL = {
  spring_fall: '봄/가을',
  summer: '여름',
  winter: '겨울',
}

function getPresetTitle(preset) {
  return PRESET_TITLE[preset.id] ?? TENT_LABEL[preset.tent] ?? preset.id
}

function getPresetMeta(preset) {
  const nights = preset.nights === 0 ? '당일' : `${preset.nights}박`
  const heater = preset.heater ? '난로' : '무난방'
  const igt = preset.igt === 'none' ? 'IGT 없음' : `IGT ${preset.igt === 'basic' ? 'Basic' : 'Full'}`
  return `${TENT_LABEL[preset.tent] ?? preset.tent} · ${SEASON_LABEL[preset.season]} · ${nights} · ${heater} · ${igt}`
}

export default function InputPanel({ input, onSelectPreset, savedPresetMap = {} }) {
  const activePreset = findPreset(input)

  return (
    <section>
      <div className="mb-4 text-center">
        <h1 className="paper-title">CampslaY</h1>
        <p className="paper-subtitle">MODEL Y CAMPING PRESET</p>
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-2">
        {PRESETS.map(preset => {
          const isActive = activePreset?.id === preset.id
          const savedPreset = savedPresetMap[preset.id]
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group min-h-20 rounded border px-2 py-2 text-left transition ${
                isActive
                  ? 'border-[#506036] bg-[#e6eed8] text-[#262820]'
                  : 'border-[#cfd5c7] bg-transparent text-stone-600 hover:border-[#506036] hover:bg-white/45'
              }`}
            >
              <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold">
                <span className={`inline-flex h-5 min-w-8 items-center justify-center rounded-sm border px-1 ${
                  isActive ? 'border-[#506036] bg-[#506036] text-white' : 'border-[#cfd5c7] bg-white/70 text-stone-500'
                }`}>
                  {preset.id}
                </span>
                {savedPreset && <span className="text-[#8a6c1a]">저장</span>}
              </span>
              <span className="block text-xs font-bold leading-snug text-[#2f3429]">
                {getPresetTitle(preset)}
              </span>
              <span className="mt-0.5 block text-[10px] leading-snug text-stone-500">
                {getPresetMeta(preset)}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
