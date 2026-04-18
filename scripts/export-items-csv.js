import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { items } = JSON.parse(readFileSync(join(__dirname, '../items.json'), 'utf-8').replace(/^\uFEFF/, ''))

const headers = [
  'id',
  'name',
  'category',
  'storage_primary',
  'storage_secondary',
  'required',
  'purchase',
  'notes',
  'presets',
  'season',
  'heater',
  'igt',
  'people_min',
  'nights_min',
]

function escapeCsv(value) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text)
    ? `"${text.replaceAll('"', '""')}"`
    : text
}

const rows = items.map(item => ({
  id: item.id,
  name: item.name,
  category: item.category,
  storage_primary: item.storage_primary ?? '',
  storage_secondary: item.storage_secondary,
  required: item.required ? 'TRUE' : 'FALSE',
  purchase: item.purchase ? 'TRUE' : 'FALSE',
  presets: JSON.stringify(item.presets ?? []),
  season: item.conditions.season,
  heater: item.conditions.heater === null ? '' : String(item.conditions.heater),
  igt: item.conditions.igt ?? '',
  people_min: item.conditions.people_min ?? 1,
  nights_min: item.conditions.nights_min ?? 0,
  notes: item.notes ?? '',
}))

const csv = [
  headers.join(','),
  ...rows.map(row => headers.map(header => escapeCsv(row[header])).join(',')),
].join('\n') + '\n'

writeFileSync(join(__dirname, '../campslay-items.csv'), csv)
writeFileSync(join(__dirname, '../campslay-items-new.csv'), csv)
console.log(`Exported ${rows.length} items.`)
