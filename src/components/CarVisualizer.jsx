const ZONE_CONFIG = {
  frunk: {
    label: '프렁크',
    sub: 'FRUNK',
    color: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', count: '#3b82f6' },
    empty: { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8', count: '#cbd5e1' },
  },
  trunk: {
    label: '트렁크',
    sub: 'TRUNK',
    color: { bg: '#dcfce7', border: '#22c55e', text: '#15803d', count: '#16a34a' },
    empty: { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8', count: '#cbd5e1' },
  },
  trunk_under: {
    label: '지하실',
    sub: 'UNDER',
    color: { bg: '#fef3c7', border: '#f59e0b', text: '#b45309', count: '#d97706' },
    empty: { bg: '#f3f4f6', border: '#e5e7eb', text: '#9ca3af', count: '#d1d5db' },
    disabled: { bg: '#f3f4f6', border: '#e5e7eb', text: '#9ca3af', count: '#9ca3af' },
  },
}

function ZoneSvgRect({ zoneKey, items, packedIds, x, y, width, height, rx, disabled, label }) {
  const cfg = ZONE_CONFIG[zoneKey]
  const theme = disabled ? cfg.disabled : items.length > 0 ? cfg.color : cfg.empty
  const doneCount = items.filter(item => packedIds.has(item.id)).length

  const maxVisible = Math.floor((height - 40) / 16)
  const visible = items.slice(0, maxVisible)
  const overflow = items.length - maxVisible

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={rx}
        fill={theme.bg} stroke={theme.border} strokeWidth="1.5" />
      <text x={x + width / 2} y={y + 16} textAnchor="middle" fontSize="10" fontWeight="700" fill={theme.text}>
        {label}
      </text>
      <text x={x + width / 2} y={y + 28} textAnchor="middle" fontSize="8" fill={theme.count}>
        {disabled ? '무박 시 미사용' : doneCount > 0 ? `${doneCount}/${items.length} 완료` : `${items.length}개`}
      </text>
      {!disabled && visible.map((item, i) => {
        const checked = packedIds.has(item.id)
        const textY = y + 44 + i * 15
        const itemLabel = item.name.length > 14 ? item.name.slice(0, 14) + '…' : item.name

        return (
          <g key={item.id} opacity={checked ? 0.58 : 1}>
            <text
              x={x + 6}
              y={textY}
              fontSize="8.5"
              fontWeight={checked ? '700' : '400'}
              fill={checked ? '#475569' : theme.text}
              textDecoration={checked ? 'line-through' : 'none'}
              style={{ overflow: 'hidden' }}
            >
              {checked ? '✓' : '·'} {itemLabel}
            </text>
            {checked && (
              <line
                x1={x + 6}
                x2={x + width - 8}
                y1={textY - 3}
                y2={textY - 3}
                stroke="#475569"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            )}
          </g>
        )
      })}
      {!disabled && overflow > 0 && (
        <text x={x + width / 2} y={y + height - 6} textAnchor="middle" fontSize="8" fill={theme.count}>
          +{overflow}개 더
        </text>
      )}
    </g>
  )
}

export default function CarVisualizer({ items, selectedIds = new Set(), packedIds = new Set(), input }) {
  const selected = items.filter(i => selectedIds.has(i.id))
  const frunk = selected.filter(i => i.storage_secondary === 'frunk')
  const trunk = selected.filter(i => i.storage_secondary === 'trunk' || i.storage_secondary === 'cabin')
  const trunkUnder = selected.filter(i => i.storage_secondary === 'trunk_under')
  const underDisabled = input.nights === 0

  const frunkH = Math.max(80, 44 + frunk.length * 15)
  const trunkH = Math.max(100, 44 + trunk.length * 15)
  const underH = 56
  const gap = 8
  const svgW = 280
  const zoneX = 30
  const zoneW = svgW - 60
  const wheelW = 16, wheelH = 44, wheelRx = 5

  const frunkY = 16
  const trunkY = frunkY + frunkH + gap
  const underY = trunkY + trunkH + gap
  const svgH = underY + underH + 16

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
      <h2 className="font-bold text-base text-stone-800 mb-3">적재 도식 — Model Y Juniper</h2>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 480 }}>
        {/* Car body */}
        <rect x="14" y="8" width={svgW - 28} height={svgH - 16} rx="28"
          fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Front label */}
        <text x={svgW / 2} y="10" textAnchor="middle" fontSize="8" fill="#94a3b8">▲ 앞 (Front)</text>

        {/* Front wheels */}
        <rect x="0" y={frunkY + frunkH / 2 - wheelH / 2} width={wheelW} height={wheelH} rx={wheelRx} fill="#475569" />
        <rect x={svgW - wheelW} y={frunkY + frunkH / 2 - wheelH / 2} width={wheelW} height={wheelH} rx={wheelRx} fill="#475569" />

        {/* Frunk zone */}
        <ZoneSvgRect zoneKey="frunk" items={frunk} packedIds={packedIds}
          x={zoneX} y={frunkY} width={zoneW} height={frunkH} rx={16}
          label="프렁크" />

        {/* Rear wheels */}
        <rect x="0" y={trunkY + trunkH / 2 - wheelH / 2} width={wheelW} height={wheelH} rx={wheelRx} fill="#475569" />
        <rect x={svgW - wheelW} y={trunkY + trunkH / 2 - wheelH / 2} width={wheelW} height={wheelH} rx={wheelRx} fill="#475569" />

        {/* Trunk zone */}
        <ZoneSvgRect zoneKey="trunk" items={trunk} packedIds={packedIds}
          x={zoneX} y={trunkY} width={zoneW} height={trunkH} rx={10}
          label="트렁크" />

        {/* Trunk under zone */}
        <ZoneSvgRect zoneKey="trunk_under" items={trunkUnder} packedIds={packedIds}
          x={zoneX} y={underY} width={zoneW} height={underH} rx={8}
          label="지하실" disabled={underDisabled} />

        {/* Back label */}
        <text x={svgW / 2} y={svgH - 2} textAnchor="middle" fontSize="8" fill="#94a3b8">▼ 뒤 (Back)</text>
      </svg>

      <div className="mt-3 flex gap-3 text-xs text-stone-500 flex-wrap">
        <span><span className="inline-block w-3 h-3 rounded bg-blue-200 mr-1"></span>프렁크 {frunk.filter(item => packedIds.has(item.id)).length}/{frunk.length}</span>
        <span><span className="inline-block w-3 h-3 rounded bg-green-200 mr-1"></span>트렁크 {trunk.filter(item => packedIds.has(item.id)).length}/{trunk.length}</span>
        <span className={underDisabled ? 'opacity-40' : ''}>
          <span className="inline-block w-3 h-3 rounded bg-amber-200 mr-1"></span>
          지하실 {underDisabled ? '미사용' : `${trunkUnder.filter(item => packedIds.has(item.id)).length}/${trunkUnder.length}`}
        </span>
      </div>
    </div>
  )
}
