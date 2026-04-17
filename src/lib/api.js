const API_URL = 'https://script.google.com/macros/s/AKfycbzdwDcBgD39-ncq-mfji1kqni0raWHNEaSUTdntCy74IRlDQ7FUD1lwUmMFDgMDvkBzQQ/exec'

export async function fetchItems() {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error('Failed to fetch items')
  const data = await res.json()
  return data.items
}
