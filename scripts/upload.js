import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const CSV_PATH = resolve(__dirname, '../campslay-items.csv')
const API_URL = 'https://script.google.com/macros/s/AKfycbzdwDcBgD39-ncq-mfji1kqni0raWHNEaSUTdntCy74IRlDQ7FUD1lwUmMFDgMDvkBzQQ/exec'

function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/, '').split('\n').filter(l => l.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const values = []
    let cur = '', inQuote = false
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote }
      else if (ch === ',' && !inQuote) { values.push(cur.trim()); cur = '' }
      else { cur += ch }
    }
    values.push(cur.trim())
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

const csv = readFileSync(CSV_PATH, 'utf-8')
const items = parseCSV(csv).filter(r => r.id)

console.log(`업로드 중... ${items.length}개 아이템`)

const res = await fetch(API_URL, {
  method: 'POST',
  redirect: 'follow',
  headers: { 'Content-Type': 'text/plain' },
  body: JSON.stringify({ action: 'upload', items }),
})

const data = await res.json()
console.log(data.success ? `완료: ${data.count}개 업로드됨` : `실패: ${data.error}`)
