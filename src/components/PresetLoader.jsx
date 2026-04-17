import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPresets } from '../lib/api'

export default function PresetLoader({ onLoad }) {
  const [open, setOpen] = useState(false)
  const { data: presets = [], isLoading } = useQuery({
    queryKey: ['presets'],
    queryFn: fetchPresets,
    staleTime: 1000 * 60,
  })

  const handleLoad = preset => {
    onLoad(preset)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-sm px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-white font-medium"
      >
        불러오기 {presets.length > 0 && <span className="ml-1 text-stone-400 text-xs">{presets.length}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 bg-white rounded-xl shadow-xl border border-stone-100 w-64 max-h-80 overflow-y-auto">
            <div className="px-4 py-3 border-b border-stone-100">
              <p className="text-xs font-semibold text-stone-500">저장된 조건</p>
            </div>
            {isLoading ? (
              <p className="text-xs text-stone-400 text-center py-6">불러오는 중...</p>
            ) : presets.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">저장된 조건이 없습니다</p>
            ) : (
              <ul>
                {presets.map((preset, i) => (
                  <li key={i}>
                    <button
                      onClick={() => handleLoad(preset)}
                      className="w-full text-left px-4 py-3 hover:bg-stone-50 border-b border-stone-50 last:border-0"
                    >
                      <p className="text-sm font-semibold text-stone-800">{preset.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        체크 {preset.checked_ids.length}개 · {preset.created_at.slice(0, 10)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
