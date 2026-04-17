const API_URL = import.meta.env.VITE_SHEETS_API_URL ||
  'https://script.google.com/macros/s/AKfycbzdwDcBgD39-ncq-mfji1kqni0raWHNEaSUTdntCy74IRlDQ7FUD1lwUmMFDgMDvkBzQQ/exec'

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
  const data = await res.json()
  if (!data.success) throw new Error(data.error ?? 'Failed to add item')
  return data
}

export async function updateItemContainer(id, storagePrimary) {
  const params = new URLSearchParams({
    action: 'updateItemContainer',
    id,
    storage_primary: storagePrimary ?? '',
  })
  const res = await fetch(`${API_URL}?${params}`)
  if (!res.ok) throw new Error('Failed to update item container')
  const data = await res.json()
  if (!data.success) throw new Error(data.error ?? 'Container assignment API is not deployed')
  return data
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
  const data = await res.json()
  if (!data.success) throw new Error(data.error ?? 'Preset API is not deployed')
  return data
}

export async function fetchPresets() {
  const res = await fetch(`${API_URL}?action=getPresets`)
  if (!res.ok) throw new Error('Failed to fetch presets')
  const data = await res.json()
  return Array.isArray(data.presets) ? data.presets : []
}
