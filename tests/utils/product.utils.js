import { expect } from '@playwright/test';

const PRODUCT_NAME_KEYS = ['productDisplayName', 'productName', 'name', 'title'];
const PRODUCT_PRICE_KEYS = ['salePrice', 'price', 'listPrice', 'offerPrice'];

/**
 * Recibe un texto de producto y devuelve una versión comparable sin acentos,
 * mayúsculas ni caracteres especiales.
 */
export const normalizeText = value => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

/**
 * Recibe un precio con formato visible y devuelve su valor numérico para comparar precios.
 */
export const normalizePrice = value => Number(value.replace(/[$,]/g, ''));

/**
 * Agrega un producto válido al listado evitando duplicados por nombre exacto.
 */
const addProduct = (products, product) => {
  if (product.name && !products.some(item => item.name === product.name)) {
    products.push(product);
  }
};

/**
 * Recibe HTML de una respuesta y agrega los productos encontrados en encabezados h3
 * junto con el primer precio localizado dentro de cada sección de producto.
 */
const extractProductsFromHtml = (body, products) => {
  const headings = [...body.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)];

  headings.forEach((heading, index) => {
    const section = body.slice(heading.index ?? 0, headings[index + 1]?.index ?? body.length);
    const name = heading[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const text = section.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
    const price = text.match(/\$[\d,]+(?:\.\d{2})?/)?.[0] || '';

    addProduct(products, { name, price });
  });
};

/**
 * Recibe el cuerpo de una respuesta JSON y recorre sus objetos para encontrar
 * nombres y precios usando las propiedades conocidas de la API de productos.
 */
const extractProductsFromJson = (body, products) => {
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    return;
  }

  const visit = value => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    const product = value;
    const name = PRODUCT_NAME_KEYS
      .map(key => product[key])
      .find(item => typeof item === 'string') || '';
    const priceInfo = product.priceInfo;
    const price = [...PRODUCT_PRICE_KEYS.map(key => product[key]), priceInfo?.salePrice, priceInfo?.promoPrice]
      .find(item => typeof item === 'string' || typeof item === 'number');

    if (name && price !== undefined) addProduct(products, { name, price: String(price) });
    Object.values(product).forEach(visit);
  };

  visit(data);
};

/**
 * Recibe una respuesta y combina productos encontrados mediante parsing HTML y JSON,
 * permitiendo soportar los dos formatos que puede devolver la aplicación.
 */
export const extractProducts = body => {
  const products = [];
  extractProductsFromHtml(body, products);
  extractProductsFromJson(body, products);
  return products;
};

/**
 * Escucha respuestas relevantes de la página y devuelve promesas con su URL y cuerpo.
 * Las respuestas sin cuerpo, como algunas redirecciones, se representan vacías.
 */
export const captureNetworkResponses = page => {
  const responses = [];
  page.on('response', response => {
    if (!['document', 'xhr', 'fetch'].includes(response.request().resourceType())) return;
    responses.push(response.text().then(body => ({ url: response.url(), body })).catch(() => ({
      url: response.url(),
      body: ''
    })));
  });
  return responses;
};

/**
 * Lee los primeros cinco productos visibles en el listado ordenado de la UI.
 */
export const getSortedProducts = async page => page.$$eval(
  '#plp-page-card-product-list a',
  items => items.slice(0, 5).map(item => ({
    name: item.querySelector('h3')?.textContent?.trim() || '',
    price: item.querySelector('div span span:first-child')?.textContent?.trim() || ''
  }))
);

/**
 * Filtra respuestas de búsqueda, extrae sus productos y conserva solo los que
 * coinciden por nombre normalizado con los productos visibles en la UI.
 */
export const getMatchingSearchProducts = async (responses, uiProducts) => (await Promise.all(responses))
  .filter(response => response.url.includes('/api/plp/search'))
  .flatMap(response => extractProducts(response.body))
  .filter((product, index, products) => products.findIndex(item => normalizeText(item.name) === normalizeText(product.name)) === index)
  .filter(product => uiProducts.some(item => normalizeText(item.name) === normalizeText(product.name)));

/**
 * Compara productos de la UI contra la respuesta de red y devuelve únicamente
 * los productos ausentes o con diferencias de nombre o precio.
 */
export const compareProducts = (uiProducts, responseProducts) => uiProducts.flatMap(uiProduct => {
  const responseProduct = responseProducts.find(product => normalizeText(product.name) === normalizeText(uiProduct.name));
  if (!responseProduct) return [{ uiProduct, responseProduct: null, differences: ['name', 'price'] }];

  const differences = [];
  if (uiProduct.name !== responseProduct.name) differences.push('name');
  if (normalizePrice(uiProduct.price) !== normalizePrice(responseProduct.price)) differences.push('price');

  return differences.length ? [{ uiProduct, responseProduct, differences }] : [];
});
