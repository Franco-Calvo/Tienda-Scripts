import fetch from "node-fetch";
import XLSX from "xlsx";

const apiUrl = "https://api.tiendanube.com/v1/4173932/products";
const perPage = 200;
const userAgent = "PruebaStock (serviciotecnico@defra.com.ar)";
const authToken = "";
const categoryId = "25494816";

async function fetchProducts() {
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
      throw new Error(`Error al traer los datos: ${response.statusText}`);
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

async function extractImagesAndVariants() {
  const products = await fetchProducts();
  const imagesData = [];
  const variantsData = [];

  products.forEach((product) => {
    if (product.images) {
      product.images.forEach((image) => {
        imagesData.push({
          image_id: image.id,
          product_id: product.id,
          position: image.position,
        });
      });
    }
    if (product.variants) {
      product.variants.forEach((variant) => {
        variantsData.push({
          variant_id: variant.id,
          product_id: product.id,
          position: variant.position,
        });
      });
    }
  });

  return { imagesData, variantsData };
}

async function saveToExcel() {
  try {
    const { imagesData, variantsData } = await extractImagesAndVariants();

    const workbook = XLSX.utils.book_new();

    const imagesSheet = XLSX.utils.json_to_sheet(imagesData);
    const variantsSheet = XLSX.utils.json_to_sheet(variantsData);

    XLSX.utils.book_append_sheet(workbook, imagesSheet, "Images");
    XLSX.utils.book_append_sheet(workbook, variantsSheet, "Variants");

    const excelFile = "productos_variantes_imagenes.xlsx";
    XLSX.writeFile(workbook, excelFile);

    console.log(`Archivo Excel guardado como ${excelFile}`);

    const combinedData = [];
    variantsData.forEach((variant) => {
      const matchedImages = imagesData.filter(
        (image) =>
          image.product_id === variant.product_id &&
          image.position === variant.position
      );
      if (matchedImages.length === 0) {
        combinedData.push({
          product_id: variant.product_id,
          variant_id: variant.variant_id,
          variant_position: variant.position,
          image_id: null,
          image_position: null,
        });
      } else {
        matchedImages.forEach((image) => {
          combinedData.push({
            product_id: variant.product_id,
            variant_id: variant.variant_id,
            variant_position: variant.position,
            image_id: image.image_id,
            image_position: image.position,
          });
        });
      }
    });

    const combinedSheet = XLSX.utils.json_to_sheet(combinedData);
    XLSX.utils.book_append_sheet(workbook, combinedSheet, "CombinedData");

    const combinedExcelFile = "productos_variantes_imagenes_combinado.xlsx";
    XLSX.writeFile(workbook, combinedExcelFile);

    console.log(`Archivo Excel combinado guardado como ${combinedExcelFile}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

saveToExcel();
