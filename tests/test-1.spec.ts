import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  const networkResponses: Promise<{ url: string; body: string }>[] = [];
  page.on('response', response => {
    if (!['document', 'xhr', 'fetch'].includes(response.request().resourceType())) return;
    networkResponses.push(
      response.text().then(body => ({ url: response.url(), body })).catch(() => ({
        url: response.url(),
        body: ''
      }))
    );
  });

  const searchTxtbox = page.getByRole('textbox', { name: 'Buscar por producto, categorí' });
  const resultSearchTitle = page.getByTestId('plp-page-heading-title-title');
  const filterCheckbox = page.getByRole('checkbox', { name: 'Blanco' });
  const sortDropdown = page.getByTestId('dropdown-sorting-button');
  const sortOptionMenorPrecio = page.getByRole('option', { name: 'Menor precio' });
  const selectedSortOption = page.getByText('Ordenar por: Menor precio');
  await page.goto('/');
  await expect(page).toHaveTitle(/Liverpool/);
  await searchTxtbox.fill('playstation 5');
  await searchTxtbox.press('Enter');
  await expect(resultSearchTitle).toBeVisible();
  await expect(resultSearchTitle).toContainText('Playstation 5');
  await filterCheckbox.click();
  await expect(filterCheckbox).toBeChecked();
  await sortDropdown.click();
  await sortOptionMenorPrecio.click();
  await expect(selectedSortOption).toBeVisible();
  const productosOrdenados = await page.$$eval('#plp-page-card-product-list a', items =>
    items.slice(0, 5).map(item => {
      const nombre = item.querySelector('h3')?.textContent?.trim() || '';
      const precio = item.querySelector('div span span:first-child')?.textContent?.trim() || '';

      return { nombre, precio };
    })
  );
  console.log('Productos extraídos de sortOptionMenorPrecio:', productosOrdenados);

  const normalizar = (valor: string) =>
    valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  const extraerProductos = (body: string) => {
    const products: { nombre: string; precio: string }[] = [];
    const headingMatches = [...body.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)];

    headingMatches.forEach((headingMatch, index) => {
      const start = headingMatch.index ?? 0;
      const end = headingMatches[index + 1]?.index ?? body.length;
      const section = body.slice(start, end);
      const nombre = headingMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const sectionText = section
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ');
      const precio = sectionText.match(/\$[\d,]+(?:\.\d{2})?/)?.[0] || '';
      if (nombre && !products.some(producto => producto.nombre === nombre)) {
        products.push({ nombre, precio });
      }
    });

      try {
        const data = JSON.parse(body) as unknown;
        const visitar = (value: unknown) => {
          if (!value || typeof value !== 'object') return;
          if (Array.isArray(value)) {
            value.forEach(visitar);
            return;
          }

          const product = value as Record<string, unknown>;
          const nombre = ['productDisplayName', 'productName', 'name', 'title']
            .map(key => product[key])
            .find((value): value is string => typeof value === 'string') || '';
          const priceInfo = product.priceInfo as Record<string, unknown> | undefined;
          const rawPrice = ['salePrice', 'price', 'listPrice', 'offerPrice']
            .map(key => product[key])
            .concat(priceInfo?.salePrice, priceInfo?.promoPrice)
            .find(value => typeof value === 'string' || typeof value === 'number');
          const precio = rawPrice === undefined ? '' : String(rawPrice);

          if (nombre && precio && !products.some(producto => producto.nombre === nombre)) {
            products.push({ nombre, precio });
          }
          Object.values(product).forEach(visitar);
        };

        visitar(data);
      } catch {
        // La respuesta puede ser HTML, que ya se procesa arriba.
      }

    return products;
  };
  const obtenerSearchResponses = async () => (await Promise.all(networkResponses))
      .filter(response => response.url.includes('/api/plp/search'))
    .map(response => ({ ...response, products: extraerProductos(response.body) }))
    .filter(({ products }) => productosOrdenados.some(producto =>
      products.some(productoRespuesta => normalizar(producto.nombre) === normalizar(productoRespuesta.nombre))
    ));

  await expect.poll(async () => (await obtenerSearchResponses()).length > 0).toBe(true);
  const searchResponses = await obtenerSearchResponses();
  const searchProducts = searchResponses.flatMap(({ products }) => products);

  const productosCoincidentes = productosOrdenados.filter(producto =>
    searchProducts.some(productoRespuesta => normalizar(producto.nombre) === normalizar(productoRespuesta.nombre))
  );

  console.log('Productos coincidentes:', productosCoincidentes);
  expect(productosCoincidentes.length).toBeGreaterThanOrEqual(3);
});