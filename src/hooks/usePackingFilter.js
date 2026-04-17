import { useMemo } from 'react'
import { getPresetId } from '../lib/presets'

const FAMILY_TENTS = new Set(['stego', 'dome_tarp', 'dome_edoshell'])

function matchesLegacyConditions(item, input) {
  const c = item.conditions
  if (!c) return false
  if (input.nights === 0 && item.storage_secondary === 'trunk_under') return false
  if (c.tent !== 'both' && c.tent !== 'all') {
    if (c.tent === 'stego') {
      if (!FAMILY_TENTS.has(input.tent)) return false
    } else if (c.tent !== input.tent) {
      return false
    }
  }
  if (c.season !== 'all' && c.season !== input.season) return false
  if (c.heater !== null && c.heater !== input.heater) return false
  if (c.igt !== null) {
    if (c.igt === 'basic_full' && input.igt === 'none') return false
    if (c.igt !== 'basic_full' && c.igt !== input.igt) return false
  }
  if (input.nights < c.nights_min) return false
  return true
}

export function getPackingMatchedIds(items, input) {
  if (!items) return new Set()
  const presetId = getPresetId(input)
  return new Set(
    items.filter(item => {
      if (Array.isArray(item.presets)) {
        return presetId ? item.presets.includes(presetId) : false
      }
      return matchesLegacyConditions(item, input)
    }).map(item => item.id)
  )
}

export function usePackingFilter(items, input) {
  return useMemo(() => getPackingMatchedIds(items, input), [items, input])
}
