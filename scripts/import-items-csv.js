import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sourcePath = join(__dirname, '../campslay-items-new.csv')
const itemsPath = join(__dirname, '../items.json')

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"'
        i += 1
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter(candidate => candidate.some(value => value !== ''))
}

function parsePresets(value) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return value.split(',').map(item => item.trim()).filter(Boolean)
  }
}

function toBool(value) {
  return value === true || String(value).toUpperCase() === 'TRUE'
}

const rows = parseCsv(readFileSync(sourcePath, 'utf8'))
const headers = rows.shift()
const existingStoragePrimaryMap = existsSync(itemsPath)
  ? Object.fromEntries(
      JSON.parse(readFileSync(itemsPath, 'utf8')).items
        .filter(item => item.storage_primary)
        .map(item => [item.id, item.storage_primary]),
    )
  : {}

const items = rows
  .map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
  .filter(row => row.id)
  .map(row => {
    const item = {
      id: row.id,
      name: row.name,
      category: row.category,
      conditions: {
        season: row.season || 'all',
        heater: toBool(row.heater) ? true : null,
        igt: row.igt || null,
        people_min: Number(row.people_min) || 1,
        nights_min: Number(row.nights_min) || 0,
      },
      required: toBool(row.required),
      purchase: toBool(row.purchase),
      notes: row.notes || '',
      storage_secondary: row.storage_secondary || '',
      presets: parsePresets(row.presets),
    }

    const storagePrimary = row.storage_primary || existingStoragePrimaryMap[row.id]
    if (storagePrimary) item.storage_primary = storagePrimary
    return item
  })

const output = {
  meta: {
    version: '1.3.0',
    updated: '2026-04-18',
    description: 'CampslaY checklist data generated from spreadsheet CSV.',
    box_dimensions: {
      torboks_75L: { w: 708, d: 434, h: 384, unit: 'mm' },
      camping_box_55L: { w: 708, d: 434, h: 384, unit: 'mm', note: 'reference size' },
    },
    spaces: {
      frunk: 'Front trunk',
      trunk: 'Main trunk',
      cabin: 'Cabin',
      trunk_under: 'Under trunk',
    },
    conditions: {
      season: 'spring_fall | summer | winter | all',
      heater: 'true | false | null',
      igt: 'none | basic | full | basic_full | null',
      nights_min: 'minimum nights',
      presets: 'P01-P09 preset ids',
    },
  },
  items,
}

const json = `${JSON.stringify(output, null, 2)}\n`
writeFileSync(itemsPath, json, 'utf8')
writeFileSync(join(__dirname, '../public/items.json'), json, 'utf8')

console.log(`Generated ${items.length} items from ${sourcePath}`)
