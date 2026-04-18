const ZONE_CONFIG = {
  frunk: {
    label: '프렁크',
    note: '앞 수납',
    color: { bg: '#eef6ff', border: '#6f9fcf', text: '#1d4f7a', fill: '#3f7fb8' },
    empty: { bg: '#f7f8f6', border: '#d5d8cf', text: '#8a8f82', fill: '#c8ccc2' },
  },
  trunk: {
    label: '트렁크',
    note: '메인 수납',
    color: { bg: '#edf8f1', border: '#78a889', text: '#2d6b43', fill: '#4c8b61' },
    empty: { bg: '#f7f8f6', border: '#d5d8cf', text: '#8a8f82', fill: '#c8ccc2' },
  },
  trunk_under: {
    label: '지하실',
    note: '하부 수납',
    color: { bg: '#fff7dc', border: '#c8a24d', text: '#815f13', fill: '#b58724' },
    empty: { bg: '#f7f8f6', border: '#d5d8cf', text: '#8a8f82', fill: '#c8ccc2' },
    disabled: { bg: '#f0f0ed', border: '#d5d5cf', text: '#9a9a91', fill: '#bdbdb7' },
  },
}

function progressColor(pct) {
  if (pct >= 100) return '#506036'
  if (pct >= 70) return '#6f8450'
  if (pct >= 35) return '#c4a557'
  return '#c8ccc2'
}

function ProgressRing({ done, total, size = 92 }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`진행률 ${pct}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="#fbfcfa" stroke="#d9ddd2" strokeWidth="8" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={progressColor(pct)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.4s ease, stroke 0.4s ease' }}
        />
        <text
          x={size / 2}
          y={size / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="17"
          fontWeight="800"
          fill="#262820"
        >
          {pct}%
        </text>
      </svg>
      <div>
        <p className="text-sm font-bold text-[#2f3429]">PACKED</p>
        <p className="text-xs text-stone-500">{done}/{total} 완료</p>
      </div>
    </div>
  )
}

function ZoneBar({ zoneKey, items, packedIds, disabled }) {
  const cfg = ZONE_CONFIG[zoneKey]
  const theme = disabled ? cfg.disabled : items.length > 0 ? cfg.color : cfg.empty
  const done = items.filter(item => packedIds.has(item.id)).length
  const pct = items.length === 0 ? 0 : Math.round((done / items.length) * 100)

  return (
    <section className="rounded-lg border px-3 py-3" style={{ background: theme.bg, borderColor: theme.border }}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold" style={{ color: theme.text }}>{cfg.label}</h3>
          <p className="text-[11px]" style={{ color: theme.text }}>{disabled ? '당일 캠프닉에서는 비활성' : cfg.note}</p>
        </div>
        <span className="rounded border bg-white/70 px-2 py-0.5 text-xs font-bold" style={{ color: theme.text, borderColor: theme.border }}>
          {disabled ? '-' : `${done}/${items.length}`}
        </span>
      </div>

      {!disabled && (
        <div className="mb-2 h-2 overflow-hidden rounded bg-white/80">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${pct}%`, background: theme.fill }}
          />
        </div>
      )}

      {!disabled && items.length > 0 && (
        <ul className="grid grid-cols-1 gap-1">
          {items.slice(0, 8).map(item => {
            const checked = packedIds.has(item.id)
            return (
              <li
                key={item.id}
                className={`truncate text-xs ${checked ? 'line-through decoration-2 opacity-45' : ''}`}
                style={{ color: theme.text }}
                title={item.name}
              >
                {checked ? '✓' : '○'} {item.name}
              </li>
            )
          })}
          {items.length > 8 && (
            <li className="text-xs" style={{ color: theme.text }}>외 {items.length - 8}개</li>
          )}
        </ul>
      )}

      {!disabled && items.length === 0 && (
        <p className="text-xs" style={{ color: theme.text }}>아직 배치된 아이템이 없습니다.</p>
      )}
    </section>
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
    <aside>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="paper-section-title">Storage Zones</h2>
          <p className="paper-section-subtitle">MODEL Y</p>
        </div>
        <p className="text-xs font-semibold text-stone-500">활성 {totalItems}개</p>
      </div>

      <div className="relative mb-4 overflow-hidden rounded border border-[#cfd5c7] bg-white/50 px-4 py-5">
        <div className="absolute bottom-0 left-0 h-8 w-full bg-[#dfe8d1]" />
        <img src="/model-y-checklist.png" alt="Tesla Model Y" className="relative z-10 mx-auto max-h-32 w-full object-contain opacity-90 mix-blend-multiply" />
      </div>

      <div className="mb-4">
        <ProgressRing done={doneItems} total={totalItems} />
      </div>

      <div className="space-y-2">
        <ZoneBar zoneKey="frunk" items={frunk} packedIds={packedIds} />
        <ZoneBar zoneKey="trunk" items={trunk} packedIds={packedIds} />
        <ZoneBar zoneKey="trunk_under" items={trunkUnder} packedIds={packedIds} disabled={underDisabled} />
      </div>
    </aside>
  )
}
