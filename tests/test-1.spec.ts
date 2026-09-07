import { test, expect, defineConfig } from '@playwright/test';

test.only('test', async ({ page }) => {
  await page.goto('');
  await expect(page).toHaveTitle('Liverpool');
  await page.getByRole('textbox', { name: 'Buscar por producto, categorí' }).fill('playstation 5');
  await page.getByRole('textbox', { name: 'Buscar por producto, categorí' }).press('Enter');
  await expect(page.getByTestId('plp-page-heading-title-title')).toContainText('Playstation 5');
  await page.getByText('Blanco').click()
  await expect(page.getByRole('checkbox', { name: 'Blanco' })).toBeChecked();
  await page.getByTestId('dropdown-sorting-button').click();
  await page.getByRole('option', { name: 'Menor precio' }).click();
  await expect(page.getByText('Ordenar por: Menor precio')).toBeVisible();
  const productos = await page.$$eval('#plp-page-card-product-list a', items =>
    items.slice(0, 5).map(item => {
      const nombre = item.querySelector('h3')?.textContent?.trim() || '';
      const precio = item.querySelector('div span span:first-child')?.textContent?.trim() || '';

      return { nombre, precio };
    })
  );
  console.log(productos);
});