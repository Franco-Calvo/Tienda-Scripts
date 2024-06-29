import fetch from "node-fetch";

const apiUrl = "https://api.tiendanube.com/v1/4173932/products";
const perPage = 200;
const userAgent = "PruebaStock (serviciotecnico@defra.com.ar)";
const authToken = "";
const categoryId = "25494816";

async function getVariantsCount() {
  let page = 1;
  let hasNextPage = true;
  let totalVariants = 0;

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

    const products = await response.json();

    products.forEach((product) => {
      if (product.variants) {
        totalVariants += product.variants.length;
      }
    });

    const linkHeader = response.headers.get("link");
    if (linkHeader && linkHeader.includes('rel="next"')) {
      page++;
    } else {
      hasNextPage = false;
    }
  }

  console.log(`Cantidad: ${totalVariants}`);
}

getVariantsCount().catch((error) => console.error(error));
