import fetch from "node-fetch";
import XLSX from "xlsx";

async function fetchProducts() {
  const apiUrl = "https://api.tiendanube.com/v1/4173932/products?page=";
  const perPage = "&per_page=200";
  const userAgent = "PruebaStock (serviciotecnico@defra.com.ar)";
  const authToken = "";
  const categoryId = "25494816";

  const workbook = XLSX.utils.book_new();
  const worksheetData = [
    ["SKU", "Product ID", "Image URL", "Position", "Canonical URL"],
  ];

  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await fetch(apiUrl + page + perPage, {
      method: "get",
      headers: {
        "User-Agent": userAgent,
        Authentication: "bearer " + authToken,
      },
    });

    const products = await response.json();
    console.log(`Page ${page} products:`, products);

    products.forEach((product) => {
      if (product.categories.some((category) => category.id == categoryId)) {
        const canonicalUrl = product.canonical_url
          ? product.canonical_url.split("/productos/")[1].replace("/", "")
          : "";

        if (product.images.length === 0) {
          worksheetData.push([
            product.variants[0]?.sku || product.sku || "",
            product.id,
            "",
            "",
            canonicalUrl,
          ]);
        } else {
          product.images.forEach((image, index) => {
            worksheetData.push([
              product.variants[0]?.sku || product.sku || "",
              product.id,
              image.src,
              index + 1,
              canonicalUrl,
            ]);
          });
        }
      }
    });

    const linkHeader = response.headers.get("link");
    if (linkHeader && linkHeader.includes('rel="next"')) {
      page++;
    } else {
      hasNextPage = false;
    }
  }

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja1");

  XLSX.writeFile(workbook, "productosTecno.xlsx");
}

fetchProducts().catch((error) => {
  console.error("Error fetching products:", error);
});
