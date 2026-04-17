import modelYImg from '../assets/model_y.png'

const ZONE_CONFIG = {
  frunk: {
    label: '프렁크',
    color: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', count: '#3b82f6' },
    empty: { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8', count: '#cbd5e1' },
  },
  trunk: {
    label: '트렁크',
    color: { bg: '#dcfce7', border: '#22c55e', text: '#15803d', count: '#16a34a' },
    empty: { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8', count: '#cbd5e1' },
  },
  trunk_under: {
    label: '지하실',
    color: { bg: '#fef3c7', border: '#f59e0b', text: '#b45309', count: '#d97706' },
    empty: { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8', count: '#cbd5e1' },
    disabled: { bg: '#f3f4f6', border: '#e5e7eb', text: '#9ca3af', count: '#9ca3af' },
  },
}

const PROGRESS_COLORS = {
  0:   '#e2e8f0',
  25:  '#93c5fd',
  50:  '#60a5fa',
  75:  '#3b82f6',
  100: '#1d4ed8',
}

function progressColor(pct) {
  if (pct >= 100) return PROGRESS_COLORS[100]
  if (pct >= 75)  return PROGRESS_COLORS[75]
  if (pct >= 50)  return PROGRESS_COLORS[50]
  if (pct >= 25)  return PROGRESS_COLORS[25]
  return PROGRESS_COLORS[0]
}

function ProgressRing({ done, total, size = 72 }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const color = progressColor(pct)

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
        <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize="15" fontWeight="700" fill="#1e293b">
          {pct}%
        </text>
      </svg>
      <p className="text-[10px] text-stone-400 mt-0.5">{done}/{total} 완료</p>
    </div>
  )
}

function ZoneBar({ zoneKey, items, packedIds, disabled }) {
  const cfg = ZONE_CONFIG[zoneKey]
  const theme = disabled ? cfg.disabled : items.length > 0 ? cfg.color : cfg.empty
  const done = items.filter(item => packedIds.has(item.id)).length
  const pct = items.length === 0 ? 0 : Math.round((done / items.length) * 100)

  return (
    <div className="rounded-lg border px-3 py-2" style={{ background: theme.bg, borderColor: theme.border }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold" style={{ color: theme.text }}>{cfg.label}</span>
        <span className="text-[10px]" style={{ color: theme.count }}>
          {disabled ? '무박 미사용' : `${done}/${items.length}`}
        </span>
      </div>
      {!disabled && items.length > 0 && (
        <>
          <div className="w-full h-1.5 rounded-full bg-white/60 overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: theme.border }}
            />
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {items.map(item => {
              const checked = packedIds.has(item.id)
              return (
                <span
                  key={item.id}
                  className={`text-[10px] ${checked ? 'line-through opacity-40' : ''}`}
                  style={{ color: theme.text }}
                >
                  {checked ? '✓' : '·'} {item.name.length > 12 ? item.name.slice(0, 12) + '…' : item.name}
                </span>
              )
            })}
          </div>
        </>
      )}
      {!disabled && items.length === 0 && (
        <p className="text-[10px]" style={{ color: theme.count }}>아이템 없음</p>
      )}
    </div>
  )
}

export default function CarVisualizer({ items, selectedIds = new Set(), packedIds = new Set(), input }) {
  const selected = items.filter(i => selectedIds.has(i.id))
  const frunk = selected.filter(i => i.storage_secondary === 'frunk')
  const trunk = selected.filter(i => i.storage_secondary === 'trunk' || i.storage_secondary === 'cabin')
  const trunkUnder = selected.filter(i => i.storage_secondary === 'trunk_under')
  const underDisabled = input.nights === 0

  const totalItems = selected.length
  const doneItems = selected.filter(i => packedIds.has(i.id)).length

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Car image */}
      <div className="relative bg-gradient-to-b from-stone-100 to-white px-4 pt-4 pb-2">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Tesla Model Y Juniper</p>
        <img src={modelYImg} alt="Model Y" className="w-full max-h-36 object-contain" />
      </div>

      {/* Progress ring + title */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
        <div>
          <h2 className="font-bold text-base text-stone-800">적재 현황</h2>
          <p className="text-xs text-stone-400 mt-0.5">활성 {totalItems}개 아이템</p>
        </div>
        <ProgressRing done={doneItems} total={totalItems} size={68} />
      </div>

      {/* Zone bars */}
      <div className="px-4 pb-4 space-y-2">
        <ZoneBar zoneKey="frunk" items={frunk} packedIds={packedIds} />
        <ZoneBar zoneKey="trunk" items={trunk} packedIds={packedIds} />
        <ZoneBar zoneKey="trunk_under" items={trunkUnder} packedIds={packedIds} disabled={underDisabled} />
      </div>
    </div>
  )
}
