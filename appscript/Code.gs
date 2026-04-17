const SHEET_NAME = 'items'

function doGet() {
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

  const output = ContentService
    .createTextOutput(JSON.stringify({ items }))
    .setMimeType(ContentService.MimeType.JSON)

  return output
}
