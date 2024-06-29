import XLSX from "xlsx";

async function cleanProductIDs() {
  const workbook = XLSX.readFile("productosFinal.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  data.forEach((row) => {
    if (row.product_id) {
      row.product_id = row.product_id.replace(/,/g, "");
    }
  });

  const updatedSheet = XLSX.utils.json_to_sheet(data);

  workbook.Sheets[workbook.SheetNames[0]] = updatedSheet;

  XLSX.writeFile(workbook, "images.xlsx");
}

cleanProductIDs().catch((error) => {
  console.error("Error cleaning product IDs:", error);
});
