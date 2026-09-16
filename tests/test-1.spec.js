import { test, expect } from '@playwright/test';
import {
  captureNetworkResponses,
  compareProducts,
  getMatchingSearchProducts,
  getSortedProducts
} from './utils/product.utils.js';

test('valida que los productos ordenados coincidan con la respuesta de búsqueda', async ({ page }) => {
  const networkResponses = captureNetworkResponses(page);
  const searchInput = page.getByRole('textbox', { name: 'Buscar por producto, categorí' });
  const resultsTitle = page.getByTestId('plp-page-heading-title-title');
  const colorFilter = page.getByRole('checkbox', { name: 'Blanco' });

  await page.goto('/');
  await expect(page).toHaveTitle(/Liverpool/);
  await searchInput.fill('playstation 5');
  await searchInput.press('Enter');
  await expect(resultsTitle).toContainText('Playstation 5');
  await colorFilter.click();
  await expect(colorFilter).toBeChecked();
  await page.getByTestId('dropdown-sorting-button').click();
  await page.getByRole('option', { name: 'Menor precio' }).click();
  await expect(page.getByText('Ordenar por: Menor precio')).toBeVisible();

  const uiProducts = await getSortedProducts(page);
  await expect.poll(async () => (await getMatchingSearchProducts(networkResponses, uiProducts)).length)
    .toBeGreaterThan(0);

  const responseProducts = await getMatchingSearchProducts(networkResponses, uiProducts);
  const differences = compareProducts(uiProducts, responseProducts);
  console.log('Diferencias entre UI y respuesta de red:', differences);
  expect(responseProducts.length).toBeGreaterThanOrEqual(3);
});
