/**
 * Database operations for Google Sheets
 */

/**
 * Get spreadsheet
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Get sheet by name
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }
  return sheet;
}

/**
 * Get all data from a sheet
 */
function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Find rows matching criteria
 */
function findRows(sheetName, criteria) {
  const data = getSheetData(sheetName);
  return data.filter(row => {
    return Object.keys(criteria).every(key => {
      return row[key] === criteria[key];
    });
  });
}

/**
 * Find single row matching criteria
 */
function findRow(sheetName, criteria) {
  const rows = findRows(sheetName, criteria);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Insert row into sheet
 */
function insertRow(sheetName, data) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const row = headers.map(header => {
    const value = data[header];
    // Handle dates and special values
    if (value === null || value === undefined) return '';
    if (value === true) return 'TRUE';
    if (value === false) return 'FALSE';
    return value;
  });

  sheet.appendRow(row);
  return data;
}

/**
 * Update row in sheet
 */
function updateRow(sheetName, criteria, updates) {
  const sheet = getSheet(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const rows = allData.slice(1);

  // Find row index
  let rowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const matches = Object.keys(criteria).every(key => {
      const colIndex = headers.indexOf(key);
      return rows[i][colIndex] === criteria[key];
    });

    if (matches) {
      rowIndex = i + 2; // +2 because sheets are 1-indexed and we skip header
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error('Row not found for update');
  }

  // Apply updates
  Object.keys(updates).forEach(key => {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1) {
      let value = updates[key];
      if (value === true) value = 'TRUE';
      if (value === false) value = 'FALSE';
      if (value === null || value === undefined) value = '';

      sheet.getRange(rowIndex, colIndex + 1).setValue(value);
    }
  });

  return true;
}

/**
 * Delete row from sheet
 */
function deleteRow(sheetName, criteria) {
  const sheet = getSheet(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const rows = allData.slice(1);

  // Find row index
  for (let i = 0; i < rows.length; i++) {
    const matches = Object.keys(criteria).every(key => {
      const colIndex = headers.indexOf(key);
      return rows[i][colIndex] === criteria[key];
    });

    if (matches) {
      sheet.deleteRow(i + 2); // +2 because sheets are 1-indexed and we skip header
      return true;
    }
  }

  return false;
}

/**
 * Get count of rows matching criteria
 */
function countRows(sheetName, criteria) {
  const rows = findRows(sheetName, criteria);
  return rows.length;
}
