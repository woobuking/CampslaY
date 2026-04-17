const API_URL = 'https://script.google.com/macros/s/AKfycbzdwDcBgD39-ncq-mfji1kqni0raWHNEaSUTdntCy74IRlDQ7FUD1lwUmMFDgMDvkBzQQ/exec'

export async function fetchItems() {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error('Failed to fetch items')
  const data = await res.json()
  return data.items
}

export async function addItem(item) {
  const params = new URLSearchParams({ action: 'addItem', ...item })
  const res = await fetch(`${API_URL}?${params}`)
  if (!res.ok) throw new Error('Failed to add item')
  return res.json()
}

export async function savePreset(name, input, checkedIds) {
  const params = new URLSearchParams({
    action: 'savePreset',
    name,
    ...input,
    heater: String(input.heater),
    checked_ids: JSON.stringify([...checkedIds]),
  })
  const res = await fetch(`${API_URL}?${params}`)
  if (!res.ok) throw new Error('Failed to save preset')
  return res.json()
}

export async function fetchPresets() {
  const res = await fetch(`${API_URL}?action=getPresets`)
  if (!res.ok) throw new Error('Failed to fetch presets')
  const data = await res.json()
  return data.presets
}
