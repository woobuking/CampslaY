import { findPreset } from '../lib/presets'

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
  both: '공통',
}

const SEASON_LABEL = {
  spring_fall: '봄/가을',
  summer: '여름',
  winter: '겨울',
  all: '전체',
}

const IGT_LABEL = {
  none: '없음',
  basic: 'Basic',
  full: 'Full',
  basic_full: 'Basic 이상',
}

export default function SavePresetModal({
  input,
  checkedIds,
  activePreset,
  linkedSavedPreset,
  onClose,
  onSave,
  isSaving,
}) {
  const preset = activePreset ?? findPreset(input)

  const handleSubmit = event => {
    event.preventDefault()
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-lg border border-[#b7beb0] bg-[#f8faf7] shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#d7dccf] px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#6c7a47]">Save preset</p>
            <h2
              className="text-2xl font-bold leading-none text-[#506036]"
              style={{ fontFamily: "'Gaegu', 'Noto Sans KR', system-ui, sans-serif" }}
            >
              {preset?.id ?? '조건'} 저장
            </h2>
          </div>
          <button onClick={onClose} className="rounded border border-[#d4d9ce] bg-white px-2 py-1 text-sm text-stone-600 hover:border-[#506036]">
            닫기
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <dl className="rounded-lg border border-[#d4d9ce] bg-white/80 p-4 text-sm text-stone-600">
            <InfoRow label="조건 번호" value={preset?.id ?? '커스텀'} />
            <InfoRow label="프리셋" value={PRESET_TITLE[preset?.id] ?? preset?.label ?? TENT_LABEL[input.tent]} />
            <InfoRow label="계절" value={SEASON_LABEL[input.season] ?? input.season} />
            <InfoRow label="박수" value={input.nights === 0 ? '당일' : `${input.nights}박`} />
            <InfoRow label="난로" value={input.heater ? 'ON' : 'OFF'} />
            <InfoRow label="IGT" value={IGT_LABEL[input.igt] ?? input.igt} />
            <InfoRow label="저장 대상" value={`${checkedIds.size}개`} />
            {linkedSavedPreset && (
              <InfoRow label="최근 저장" value={linkedSavedPreset.created_at.slice(0, 10)} />
            )}
          </dl>

          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="rounded border border-[#d4d9ce] bg-white/70 px-3 py-3 text-xs leading-relaxed text-stone-600">
              현재 활성 체크리스트를 이 프리셋의 저장본으로 기록합니다. 수납 여부는 각 아이템의 primary storage 값을 기준으로 따로 유지됩니다.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-[#d4d9ce] bg-white py-2 text-sm font-semibold text-stone-600 hover:border-[#506036]"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSaving || !preset}
                className="flex-1 rounded-lg border border-[#506036] bg-[#506036] py-2 text-sm font-semibold text-white hover:bg-[#40502a] disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-300"
              >
                {isSaving ? '저장 중' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#eceee8] py-1.5 last:border-b-0">
      <dt className="text-stone-400">{label}</dt>
      <dd className="text-right font-semibold text-[#262820]">{value}</dd>
    </div>
  )
}
