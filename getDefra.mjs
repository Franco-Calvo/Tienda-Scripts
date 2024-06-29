import fetch from "node-fetch";
import XLSX from "xlsx";

async function fetchProducts() {
  const apiUrl = "https://api.tiendanube.com/v1/2382377/products?page=";
  const perPage = "&per_page=200";
  const userAgent = "PruebaStock (serviciotecnico@defra.com.ar)";
  const authToken = "";
  const categoryId = "15826454";

  const workbook = XLSX.utils.book_new();
  const worksheetData = [
    ["SKU", "Product ID", "Image URL", "Position", "Canonical URL"],
  ];

  for (let page = 1; page <= 8; page++) {
    const response = await fetch(apiUrl + page + perPage, {
      method: "get",
      headers: {
        "User-Agent": userAgent,
        Authentication: "bearer " + authToken,
      },
    });

    const products = await response.json();
    console.log(products);

    products.forEach((product) => {
      if (product.categories.some((category) => category.id == categoryId)) {
        const canonicalUrl = product.canonical_url
          ? product.canonical_url.split("/productos/")[1].replace("/", "")
          : "";

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
    });
  }

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja1");

  XLSX.writeFile(workbook, "productosDefra.xlsx");
}

fetchProducts().catch((error) => {
  console.error("Error fetching products:", error);
});
