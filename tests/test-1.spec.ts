import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
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
  const productos = await page.$$eval('#plp-page-card-product-list a', items =>
    items.slice(0, 5).map(item => {
      const nombre = item.querySelector('h3')?.textContent?.trim() || '';
      const precio = item.querySelector('div span span:first-child')?.textContent?.trim() || '';

      return { nombre, precio };
    })
  );
  console.log(productos);
});