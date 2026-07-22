const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const excelPath = 'c:\\Users\\brind\\Downloads\\gallery nails.xlsx';
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('Excel data:', JSON.stringify(data, null, 2));

// Save to JSON for reference
fs.writeFileSync(
  path.join(__dirname, 'gallery-data.json'),
  JSON.stringify(data, null, 2)
);

console.log('Data saved to gallery-data.json');
