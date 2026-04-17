const SHEET_NAME = 'items'
const PRESETS_SHEET_NAME = 'presets'
const ITEM_HEADERS = [
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
const PRESET_HEADERS = ['name', 'created_at', 'tent', 'nights', 'season', 'heater', 'igt', 'people', 'checked_ids']

function ensureItemsSheetHeaders(sheet) {
  const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), ITEM_HEADERS.length)).getValues()[0]
  const currentHeaders = current.filter(Boolean)
  if (currentHeaders.join('|') !== ITEM_HEADERS.join('|')) {
    sheet.getRange(1, 1, 1, ITEM_HEADERS.length).setValues([ITEM_HEADERS])
    const extraColumns = sheet.getLastColumn() - ITEM_HEADERS.length
    if (extraColumns > 0) {
      sheet.getRange(1, ITEM_HEADERS.length + 1, sheet.getMaxRows(), extraColumns).clearContent()
    }
  }
  return ITEM_HEADERS
}

function ensurePresetsSheetHeaders(sheet) {
  const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), PRESET_HEADERS.length)).getValues()[0]
  const currentHeaders = current.filter(Boolean)
  if (currentHeaders.length === 0) {
    sheet.getRange(1, 1, 1, PRESET_HEADERS.length).setValues([PRESET_HEADERS])
    return PRESET_HEADERS
  }

  const headers = currentHeaders.slice()
  PRESET_HEADERS.forEach(header => {
    if (headers.indexOf(header) === -1) {
      headers.push(header)
      sheet.getRange(1, headers.length).setValue(header)
    }
  })
  return headers
}

function parsePresets(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    return String(value)
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)
  }
}

function parseJsonArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    return []
  }
}

function getOrCreatePresetsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(PRESETS_SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(PRESETS_SHEET_NAME)
  }
  ensurePresetsSheetHeaders(sheet)
  return sheet
}

function doGet(e) {
  const action = e && e.parameter && e.parameter.action

  if (action === 'addItem')    return handleAddItem(e.parameter)
  if (action === 'updateItemContainer') return handleUpdateItemContainer(e.parameter)
  if (action === 'savePreset') return handleSavePreset(e.parameter)
  if (action === 'getPresets') return handleGetPresets()

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  const hasPresetColumn = headers.indexOf('presets') !== -1

  const items = data.slice(1)
    .map(row => {
      const r = {}
      headers.forEach((h, i) => r[h] = row[i])
      if (!r.id) return null
      const item = {
        id: String(r.id),
        name: String(r.name),
        category: String(r.category),
        storage_primary: r.storage_primary || null,
        storage_secondary: String(r.storage_secondary),
        required: r.required === true || r.required === 'TRUE',
        purchase: r.purchase === true || r.purchase === 'TRUE',
        notes: r.notes || '',
        conditions: {
          season: String(r.season || 'all'),
          heater: r.heater === true || r.heater === 'TRUE' ? true : null,
          igt: r.igt || null,
          people_min: Number(r.people_min) || 1,
          nights_min: Number(r.nights_min) || 0,
        }
      }
      if (hasPresetColumn) {
        item.presets = parsePresets(r.presets)
      } else {
        item.conditions.tent = String(r.tent || 'both')
      }
      return item
    })
    .filter(Boolean)

  return ContentService
    .createTextOutput(JSON.stringify({ items }))
    .setMimeType(ContentService.MimeType.JSON)
}

function handleAddItem(params) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    const headers = ensureItemsSheetHeaders(sheet)
    const newRow = headers.map(h => params[h] !== undefined ? params[h] : '')
    sheet.appendRow(newRow)
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

function handleUpdateItemContainer(params) {
  try {
    if (!params.id) throw new Error('Missing id')

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    const headers = ensureItemsSheetHeaders(sheet)
    const idCol = headers.indexOf('id') + 1
    const storagePrimaryCol = headers.indexOf('storage_primary') + 1
    if (idCol <= 0 || storagePrimaryCol <= 0) throw new Error('Missing required headers')

    const data = sheet.getDataRange().getValues()
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idCol - 1]) === String(params.id)) {
        sheet.getRange(i + 1, storagePrimaryCol).setValue(params.storage_primary || '')
        return ContentService
          .createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON)
      }
    }

    throw new Error(`Item not found: ${params.id}`)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

function handleSavePreset(params) {
  try {
    const sheet = getOrCreatePresetsSheet()
    const headers = ensurePresetsSheetHeaders(sheet)
    const row = headers.map(header => {
      if (header === 'created_at') return new Date().toISOString()
      return params[header] !== undefined ? params[header] : ''
    })
    sheet.appendRow(row)
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

function handleGetPresets() {
  try {
    const sheet = getOrCreatePresetsSheet()
    ensurePresetsSheetHeaders(sheet)
    const data = sheet.getDataRange().getValues()
    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ presets: [] }))
        .setMimeType(ContentService.MimeType.JSON)
    }
    const headers = data[0]
    const presets = data.slice(1).map(row => {
      const r = {}
      headers.forEach((h, i) => r[h] = row[i])
      return {
        name: String(r.name),
        created_at: String(r.created_at),
        input: {
          tent: String(r.tent),
          nights: Number(r.nights),
          season: String(r.season),
          heater: r.heater === 'true' || r.heater === true,
          igt: String(r.igt),
          people: Number(r.people),
        },
        checked_ids: parseJsonArray(r.checked_ids),
      }
    })
    return ContentService
      .createTextOutput(JSON.stringify({ presets }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ presets: [], error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

function doPost(e) {
  try {
    const { action, items } = JSON.parse(e.postData.contents)
    if (action !== 'upload') throw new Error('Unknown action')

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    const headers = ensureItemsSheetHeaders(sheet)

    // Preserve storage_primary values already in the sheet
    const existingData = sheet.getDataRange().getValues()
    const existingHeaders = existingData[0]
    const idIdx = existingHeaders.indexOf('id')
    const spIdx = existingHeaders.indexOf('storage_primary')
    const storagePrimaryMap = {}
    if (idIdx >= 0 && spIdx >= 0) {
      existingData.slice(1).forEach(row => {
        if (row[idIdx] && row[spIdx]) storagePrimaryMap[String(row[idIdx])] = row[spIdx]
      })
    }

    const lastRow = sheet.getLastRow()
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent()

    const rows = items.map(item => headers.map(h => {
      if (h === 'storage_primary') return item[h] || storagePrimaryMap[item.id] || ''
      return item[h] ?? ''
    }))
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows)

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, count: items.length }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}
