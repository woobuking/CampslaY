import process from 'node:process'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const API_URL = process.env.VITE_SHEETS_API_URL ||
  'https://script.google.com/macros/s/AKfycbzdwDcBgD39-ncq-mfji1kqni0raWHNEaSUTdntCy74IRlDQ7FUD1lwUmMFDgMDvkBzQQ/exec'

const { items } = JSON.parse(readFileSync(join(__dirname, '../items.json'), 'utf-8'))

console.log(`업로드 중... ${items.length}개 아이템`)

const flat = items.map(item => ({
  id: item.id,
  name: item.name,
  category: item.category,
  storage_primary: item.storage_primary ?? '',
  storage_secondary: item.storage_secondary,
  required: item.required ? 'TRUE' : 'FALSE',
  purchase: item.purchase ? 'TRUE' : 'FALSE',
  notes: item.notes ?? '',
  presets: JSON.stringify(item.presets ?? []),
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
  console.log(`완료: ${data.count}개 업로드됨`)
} else {
  console.error(`실패: ${data.error}`)
  process.exit(1)
}
