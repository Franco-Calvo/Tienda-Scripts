import fetch from "node-fetch";
import XLSX from "xlsx";
import { setTimeout } from "timers/promises";

const apiUrl = "https://api.tiendanube.com/v1/4173932";
const userAgent = "PruebaStock (serviciotecnico@defra.com.ar)";
const authToken = "";

async function updateProductImage(productId, imageId, body) {
  const url = `${apiUrl}/products/${productId}/images/${imageId}`;
  const headers = {
    "User-Agent": userAgent,
    Authentication: `bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorMessage = `Error al actualizar la imagen ${imageId} del producto ${productId}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const jsonResponse = await response.json();
    console.log(
      `Imagen ${imageId} del producto ${productId} actualizada correctamente:`,
      jsonResponse
    );
  } catch (error) {
    console.error(error.message);
  }
}

async function processExcelFile() {
  try {
    const workbook = XLSX.readFile(
      "productos_variantes_imagenes_actualizado.xlsx"
    );
    const sheetName = "CombinedData2";
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (let row of sheet) {
      const { product_id, image_id, image_src, position } = row;

      if (image_src) {
        const body = {
          position,
          image_src,
        };

        await updateProductImage(product_id, image_id, body);

        await setTimeout(10000);
      }
    }

    console.log("Proceso completado.");
  } catch (error) {
    console.error("Error al procesar el archivo Excel:", error);
  }
}

processExcelFile();
