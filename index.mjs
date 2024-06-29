import * as XLSX from "xlsx";
import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";

const filePath = path.resolve("./images.xlsx");

const processFile = async (filePath) => {
  const file = fs.readFileSync(filePath);
  const workbook = XLSX.read(file, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  for (const image of jsonData) {
    try {
      const response = await fetch(
        `https://api.tiendanube.com/v1/4173932/products/${image.product_id}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authentication: "bearer ",
            "User-Agent": "PruebaStock (serviciotecnico@defra.com.ar)",
          },
          body: JSON.stringify({
            product_id: image.product_id,
            src: image.image_url,
            position: image.position,
          }),
          timeout: 15000,
        }
      );

      if (response.ok) {
        console.log(
          `La imagen ${image.product_id} |  ${image.image_url} | ${image.position} se subió correctamente.`
        );
      } else {
        console.log(
          `La imagen ${image.product_id} |  ${image.image_url} | ${image.position} falló.`,
          await response.text()
        );
      }
    } catch (error) {
      console.error(
        `Error en ${image.product_id} |  ${image.src} | ${image.position} :`,
        error.message
      );
    }
  }
};

processFile(filePath).catch(console.error);
