import fetch from "node-fetch";
import XLSX from "xlsx";

const apiUrl1 = "https://api.tiendanube.com/v1/2382377/products";
const apiUrl2 = "https://api.tiendanube.com/v1/4173932/products";
const perPage = 200;
const userAgent = "PruebaStock (serviciotecnico@defra.com.ar)";
const authToken1 = "";
const authToken2 = "";
const categoryId1 = "15826454";
const categoryId2 = "25494816";

async function fetchProducts(apiUrl, authToken, categoryId) {
  let page = 1;
  let hasNextPage = true;
  const products = [];

  while (hasNextPage) {
    const response = await fetch(
      `${apiUrl}?category_id=${categoryId}&page=${page}&per_page=${perPage}`,
      {
        method: "get",
        headers: {
          "User-Agent": userAgent,
          Authentication: `bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const result = await response.json();
    products.push(...result);

    const linkHeader = response.headers.get("link");
    if (linkHeader && linkHeader.includes('rel="next"')) {
      page++;
    } else {
      hasNextPage = false;
    }
  }

  return products;
}

async function extractData(products) {
  const combinedData = [];

  products.forEach((product) => {
    const canonical_url = product.canonical_url;
    const product_id = product.id;

    product.variants.forEach((variant) => {
      const variant_id = variant.id;
      const sku = variant.sku;
      const image_id = variant.image_id;

      let position = null;
      let image_src = null;
      if (image_id) {
        const image = product.images.find((img) => img.id === image_id);
        if (image) {
          position = image.position;
          image_src = image.src;
        }
      }

      combinedData.push({
        product_id,
        variant_id,
        sku,
        image_id,
        position,
        canonical_url,
        image_src,
      });
    });
  });

  return combinedData;
}

async function saveToExcel(data, sheetName, workbook) {
  const sheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
}

async function main() {
  try {
    const products1 = await fetchProducts(apiUrl1, authToken1, categoryId1);
    const combinedData1 = await extractData(products1);

    const workbook = XLSX.utils.book_new();

    await saveToExcel(combinedData1, "CombinedData1", workbook);

    const tempExcelFile = "productos_variantes_imagenes_temp.xlsx";
    XLSX.writeFile(workbook, tempExcelFile);

    const products2 = await fetchProducts(apiUrl2, authToken2, categoryId2);
    const combinedData2 = await extractData(products2);

    const workbookTemp = XLSX.readFile(tempExcelFile);
    const sheet1 = workbookTemp.Sheets["CombinedData1"];
    const combinedData1FromSheet = XLSX.utils.sheet_to_json(sheet1);

    const finalCombinedData = combinedData2.map((data2) => {
      const canonicalPart2 = data2.canonical_url.split("/productos/")[1];
      const matchedData = combinedData1FromSheet.find((data1) => {
        const canonicalPart1 = data1.canonical_url.split("/productos/")[1];
        return (
          data1.sku === data2.sku &&
          canonicalPart1 === canonicalPart2 &&
          data1.image_src === data2.image_src
        );
      });

      if (matchedData) {
        return {
          product_id: data2.product_id,
          variant_id: data2.variant_id,
          sku: data2.sku,
          image_id: data2.image_id,
          position: matchedData.position,
          canonical_url: data2.canonical_url,
          image_src: data2.image_src,
        };
      }

      return data2;
    });

    await saveToExcel(finalCombinedData, "CombinedData2", workbook);

    const finalExcelFile = "productos_variantes_imagenes_final.xlsx";
    XLSX.writeFile(workbook, finalExcelFile);

    console.log(`Archivo Excel guardado como ${finalExcelFile}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

main();
