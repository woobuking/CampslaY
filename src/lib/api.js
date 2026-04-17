const API_URL = import.meta.env.VITE_SHEETS_API_URL

export async function fetchItems() {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error('Failed to fetch items')
  const data = await res.json()
  return data.items
}
