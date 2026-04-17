import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const API_URL = 'https://script.google.com/macros/s/AKfycbzdwDcBgD39-ncq-mfji1kqni0raWHNEaSUTdntCy74IRlDQ7FUD1lwUmMFDgMDvkBzQQ/exec'

const { items } = JSON.parse(readFileSync(join(__dirname, '../items.json'), 'utf-8'))

console.log(`Uploading ${items.length} items...`)

const flat = items.map(item => ({
  id: item.id,
  name: item.name,
  category: item.category,
  storage_primary: item.storage_primary ?? '',
  storage_secondary: item.storage_secondary,
  required: item.required ? 'TRUE' : 'FALSE',
  purchase: item.purchase ? 'TRUE' : 'FALSE',
  notes: item.notes ?? '',
  tent: item.conditions.tent,
  season: item.conditions.season,
  heater: item.conditions.heater === null ? '' : String(item.conditions.heater),
  igt: item.conditions.igt ?? '',
  people_min: item.conditions.people_min ?? 1,
  nights_min: item.conditions.nights_min ?? 0,
}))

const res = await fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: JSON.stringify({ action: 'upload', items: flat }),
})

const data = await res.json()
if (data.success) {
  console.log(`Done: ${data.count} items uploaded.`)
} else {
  console.error('Failed:', data.error)
  process.exit(1)
}
