import { test, expect } from '@playwright/test';

import { skipGuestGate, waitForAppReady } from './helpers';

test.describe('busca e catálogo', () => {
  test.beforeEach(async ({ page }) => {
    await skipGuestGate(page);
  });

  test('home carrega categorias e o card de contagem', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await expect(
      page.getByRole('heading', { name: /Encontre quem/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Ou escolha uma categoria/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: /profissionais? cadastrados? no TemPro/i,
      }),
    ).toBeVisible();
  });

  test('busca por texto leva aos resultados', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await page.getByLabel('Qual serviço você procura?').fill('eletricista');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page).toHaveURL(/\/buscar\?/);
    await expect(page.url()).toContain('q=eletricista');
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(page.locator('.sp-pcard').first()).toBeVisible();
  });

  test('categoria da home abre a lista filtrada', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    const category = page.locator('.sp-cat').first();
    const name = (await category.locator('.sp-cat__name').innerText()).trim();
    await category.click();

    await expect(page).toHaveURL(/\/buscar\?/);
    await expect(page.locator('.sp-pcard').first()).toBeVisible();
    await expect(page.getByRole('heading').first()).toContainText(
      new RegExp(name.split(/\s+/)[0], 'i'),
    );
  });

  test('abre o perfil público a partir dos resultados', async ({ page }) => {
    await page.goto('/buscar?q=eletricista&cidade=Santa%20Cruz%20do%20Sul%20-%20RS');
    await waitForAppReady(page);

    const card = page.locator('.sp-pcard').first();
    await expect(card).toBeVisible();
    const providerName = (
      await card.locator('.sp-pcard__name').innerText()
    ).trim();
    await card.locator('.sp-pcard__link').click();

    await expect(page).toHaveURL(/\/prestador\//);
    await expect(
      page.getByRole('heading', { name: providerName, exact: true }),
    ).toBeVisible();
  });
});
