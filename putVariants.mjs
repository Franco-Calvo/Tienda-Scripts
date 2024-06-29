import fetch from "node-fetch";
import XLSX from "xlsx";

const workbook = XLSX.readFile("productos_variantes_imagenes_actualizado.xlsx");
const sheetName = "CombinedData2";
const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

const apiUrl = "https://api.tiendanube.com/v1/4173932";
const userAgent = "PruebaStock (serviciotecnico@defra.com.ar)";
const authToken = "";

async function updateVariantImage(product_id, variant_id, image_id) {
  const url = `${apiUrl}/products/${product_id}/variants/${variant_id}`;
  const body = {
    image_id: image_id,
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "User-Agent": userAgent,
      Authentication: `bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `Error al actualizar las variantes: ${response.statusText}`
    );
  }

  return response.json();
}

async function processVariants() {
  let count = 0;

  for (const row of sheet) {
    const { product_id, variant_id, image_id } = row;

    if (product_id && variant_id && image_id) {
      try {
        await updateVariantImage(product_id, variant_id, image_id);
        console.log(
          `Variante actualizada ${variant_id} con la imagen ${image_id}`
        );
      } catch (error) {
        console.error(
          `Falló el upgrade de la variante ${variant_id}: ${error.message}`
        );
      }

      count++;
      if (count % 10 === 0) {
        console.log("Esperando 10 segundos...");
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }
  }
}

processVariants()
  .then(() => {
    console.log("Todas las variantes se procesaron correctamente.");
  })
  .catch((error) => {
    console.error(`Error al procesar las variantes: ${error.message}`);
  });
