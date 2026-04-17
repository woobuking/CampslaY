import { findPreset } from '../lib/presets'

const TENT_LABEL = { edoshell: '에도쉘 솔캠', stego: '스테고', dome_tarp: '돔+타프', dome_edoshell: '돔+에도쉘', both: '공통' }
const SEASON_LABEL = { spring_fall: '봄/가을', summer: '여름', winter: '겨울', all: '전체' }
const IGT_LABEL = { none: '없음', basic: 'Basic', full: 'Full', basic_full: 'Basic 이상' }

export default function SavePresetModal({ input, checkedIds, activePreset, linkedSavedPreset, onClose, onSave, isSaving }) {
  const preset = activePreset ?? findPreset(input)

  const handleSubmit = e => {
    e.preventDefault()
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-bold text-stone-800">{preset?.id ?? '커스텀'} 저장</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none">×</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="bg-stone-50 rounded-lg px-4 py-3 text-sm space-y-1 text-stone-600">
            <div className="flex justify-between">
              <span className="text-stone-400">조건 번호</span>
              <span className="font-medium">{preset?.id ?? '커스텀'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">텐트</span>
              <span className="font-medium">{preset?.label ?? TENT_LABEL[input.tent]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">계절</span>
              <span className="font-medium">{SEASON_LABEL[input.season]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">박수</span>
              <span className="font-medium">{input.nights === 0 ? '당일' : `${input.nights}박`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">난로</span>
              <span className="font-medium">{input.heater ? 'ON' : 'OFF'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">IGT</span>
              <span className="font-medium">{IGT_LABEL[input.igt] ?? input.igt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">저장 대상 아이템</span>
              <span className="font-medium">{checkedIds.size}개</span>
            </div>
            {linkedSavedPreset && (
              <div className="flex justify-between">
                <span className="text-stone-400">최근 저장</span>
                <span className="font-medium">{linkedSavedPreset.created_at.slice(0, 10)}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs leading-relaxed text-stone-500">
              현재 활성 아이템 목록을 {preset?.id ?? '현재 조건'}에 맞는 저장본으로 덮어씁니다. 수납 여부는 아이템의 primary storage 기준으로 따로 유지됩니다.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:bg-stone-50">
                취소
              </button>
              <button type="submit" disabled={isSaving || !preset}
                className="flex-1 py-2 rounded-lg bg-stone-800 text-white text-sm font-semibold hover:bg-stone-700 disabled:opacity-40">
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
