import { test, expect } from '@playwright/test';

import { loginAsDemo, skipGuestGate, waitForAppReady } from './helpers';

test.describe('header da home', () => {
  test('cliente não vê o link da área do prestador', async ({ page }) => {
    await skipGuestGate(page);
    await page.goto('/');
    await waitForAppReady(page);

    await expect(
      page.getByRole('heading', { name: /Encontre quem/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Área do prestador' }),
    ).toHaveCount(0);
  });

  test('prestador logado vê o link do painel', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/');
    await waitForAppReady(page);

    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Painel' }),
    ).toBeVisible();
  });
});
