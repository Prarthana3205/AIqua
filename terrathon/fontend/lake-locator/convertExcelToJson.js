import XLSX from "xlsx";
import { writeFileSync } from "fs";

// Load the Excel file from the public folder
const filePath = "./public/LakeData.xlsx";
const workbook = XLSX.readFile(filePath);

// Get the first sheet name
const sheetName = workbook.SheetNames[0];

// Convert the sheet to JSON
const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Save JSON data to a file inside src/assets/
const jsonFilePath = "./src/assets/lakes.json";
writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 4));

console.log("✅ Conversion complete! JSON file saved to src/assets/lakes.json");
