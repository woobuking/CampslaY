export function usePackingFilter(items, input) {
  if (!items) return new Set()
  return new Set(
    items.filter(item => {
      const c = item.conditions
      if (input.nights === 0 && item.storage_secondary === 'trunk_under') return false
      if (c.tent !== 'both' && c.tent !== input.tent) return false
      if (c.season !== 'all' && c.season !== input.season) return false
      if (c.heater !== null && c.heater !== input.heater) return false
      if (c.igt !== null) {
        if (c.igt === 'basic_full' && input.igt === 'none') return false
        if (c.igt !== 'basic_full' && c.igt !== input.igt) return false
      }
      if (input.people < c.people_min) return false
      if (input.nights < c.nights_min) return false
      return true
    }).map(item => item.id)
  )
}
