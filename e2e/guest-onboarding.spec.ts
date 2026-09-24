import { test, expect } from '@playwright/test';

import { clearAppStorage, waitForAppReady } from './helpers';

test.describe('gate e onboarding de cliente', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
  });

  test('redireciona a home para a tela de boas-vindas', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/bem-vindo\/?$/);
    await expect(page.getByRole('heading', { name: 'TemPro' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Sou prestador de serviço/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Sou cliente/i }),
    ).toBeVisible();
  });

  test('prestador segue para o cadastro', async ({ page }) => {
    await page.goto('/bem-vindo');
    await page.getByRole('link', { name: /Sou prestador de serviço/i }).click();
    await expect(page).toHaveURL(/\/cadastrar\/?$/);
    await waitForAppReady(page);
    await expect(
      page.getByRole('heading', { name: 'Criar conta de prestador' }),
    ).toBeVisible();
  });

  test('cliente completa o onboarding e chega na home', async ({ page }) => {
    await page.goto('/bem-vindo');
    await page.getByRole('link', { name: /Sou cliente/i }).click();
    await expect(page).toHaveURL(/\/onboarding\/?$/);

    await expect(
      page.getByRole('heading', { name: 'Encontre prestadores' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Próximo' }).click();
    await expect(
      page.getByRole('heading', { name: 'Busque pelo que precisa' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Próximo' }).click();
    await expect(
      page.getByRole('heading', { name: 'Fale direto com ele' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Ver prestadores' }).click();

    await expect(page).toHaveURL(/\/$/);
    await waitForAppReady(page);
    await expect(
      page.getByRole('heading', { name: /Encontre quem/i }),
    ).toBeVisible();
  });

  test('pular o onboarding também libera a home', async ({ page }) => {
    await page.goto('/onboarding');
    await page.getByRole('button', { name: 'Pular' }).click();
    await expect(page).toHaveURL(/\/$/);
    await waitForAppReady(page);
    await expect(
      page.getByRole('heading', { name: /Encontre quem/i }),
    ).toBeVisible();
  });
});
