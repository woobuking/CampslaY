const SHEET_NAME = 'items'
const PRESETS_SHEET_NAME = 'presets'

function getOrCreatePresetsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(PRESETS_SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(PRESETS_SHEET_NAME)
    sheet.appendRow(['name', 'created_at', 'tent', 'nights', 'season', 'heater', 'igt', 'people', 'checked_ids'])
  }
  return sheet
}

function doGet(e) {
  const action = e && e.parameter && e.parameter.action

  if (action === 'addItem')    return handleAddItem(e.parameter)
  if (action === 'savePreset') return handleSavePreset(e.parameter)
  if (action === 'getPresets') return handleGetPresets()

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  const data = sheet.getDataRange().getValues()
  const headers = data[0]

  const items = data.slice(1)
    .map(row => {
      const r = {}
      headers.forEach((h, i) => r[h] = row[i])
      if (!r.id) return null
      return {
        id: String(r.id),
        name: String(r.name),
        category: String(r.category),
        storage_primary: r.storage_primary || null,
        storage_secondary: String(r.storage_secondary),
        required: r.required === true || r.required === 'TRUE',
        purchase: r.purchase === true || r.purchase === 'TRUE',
        notes: r.notes || '',
        conditions: {
          tent: String(r.tent),
          season: String(r.season),
          heater: r.heater === true || r.heater === 'TRUE' ? true : null,
          igt: r.igt || null,
          people_min: Number(r.people_min) || 1,
          nights_min: Number(r.nights_min) || 0,
        }
      }
    })
    .filter(Boolean)

  return ContentService
    .createTextOutput(JSON.stringify({ items }))
    .setMimeType(ContentService.MimeType.JSON)
}

function handleAddItem(params) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
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

function handleSavePreset(params) {
  try {
    const sheet = getOrCreatePresetsSheet()
    sheet.appendRow([
      params.name,
      new Date().toISOString(),
      params.tent,
      params.nights,
      params.season,
      params.heater,
      params.igt,
      params.people,
      params.checked_ids,
    ])
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
        checked_ids: JSON.parse(r.checked_ids || '[]'),
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
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]

    const lastRow = sheet.getLastRow()
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent()

    const rows = items.map(item => headers.map(h => item[h] ?? ''))
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
