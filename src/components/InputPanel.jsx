import { PRESETS, findPreset } from '../lib/presets'

const TENT_LABEL = {
  edoshell:      '에도쉘 솔캠',
  stego:         '스테고',
  dome_tarp:     '돔+타프',
  dome_edoshell: '돔+에도쉘',
}

const SEASON_LABEL = {
  spring_fall: '봄/가을',
  summer:      '여름',
  winter:      '겨울',
}

const TENT_STYLE = {
  edoshell:      { idle: 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400',       active: 'bg-stone-800 border-stone-800 text-white' },
  stego:         { idle: 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-400', active: 'bg-emerald-700 border-emerald-700 text-white' },
  dome_tarp:     { idle: 'bg-sky-50 border-sky-200 text-sky-900 hover:border-sky-400',               active: 'bg-sky-600 border-sky-600 text-white' },
  dome_edoshell: { idle: 'bg-violet-50 border-violet-200 text-violet-900 hover:border-violet-400',   active: 'bg-violet-700 border-violet-700 text-white' },
}

export default function InputPanel({ input, onChange }) {
  const activePreset = findPreset(input)

  const select = (preset) => {
    onChange(() => ({
      tent:   preset.tent,
      season: preset.season,
      nights: preset.nights,
      heater: preset.heater,
      igt:    preset.igt,
    }))
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
      <h2 className="font-bold text-base text-stone-800 mb-3">캠핑 조건 설정</h2>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {PRESETS.map(preset => {
          const style = TENT_STYLE[preset.tent]
          const isActive = activePreset?.id === preset.id
          return (
            <button
              key={preset.id}
              onClick={() => select(preset)}
              className={`relative text-left rounded-lg border px-2.5 py-2 transition-colors
                ${isActive ? style.active : style.idle}`}
            >
              <span className={`absolute top-1.5 right-1.5 text-[9px] font-bold ${isActive ? 'opacity-80' : 'opacity-40'}`}>
                {preset.id}
              </span>
              <p className="text-xs font-bold leading-tight pr-6">{TENT_LABEL[preset.tent]}</p>
              <p className={`text-[10px] mt-0.5 ${isActive ? 'opacity-80' : 'opacity-50'}`}>
                {SEASON_LABEL[preset.season]} · {preset.nights === 0 ? '당일' : '1박'}
              </p>
              {preset.igt !== 'none' && (
                <p className={`text-[10px] ${isActive ? 'opacity-80' : 'opacity-50'}`}>
                  IGT {preset.igt === 'basic' ? 'Basic' : 'Full'}
                </p>
              )}
              {preset.heater && (
                <p className={`text-[10px] ${isActive ? 'opacity-80' : 'opacity-50'}`}>난로</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
