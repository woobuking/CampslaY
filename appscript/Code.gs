const SHEET_NAME = 'items'

function doGet(e) {
  const action = e && e.parameter && e.parameter.action

  if (action === 'addItem') {
    return handleAddItem(e.parameter)
  }

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

    const newRow = headers.map(h => {
      if (params[h] !== undefined) return params[h]
      return ''
    })

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
