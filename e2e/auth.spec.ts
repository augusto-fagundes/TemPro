import { test, expect } from '@playwright/test';

import {
  clearAppStorage,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  loginAsDemo,
  skipGuestGate,
  waitForAppReady,
} from './helpers';

test.describe('autenticação do prestador', () => {
  test('login demo abre o painel com a saudação', async ({ page }) => {
    await clearAppStorage(page);
    await loginAsDemo(page);
    await expect(page.getByRole('heading', { name: /^Olá,/ })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Visão geral', exact: true }),
    ).toBeVisible();
  });

  test('senha errada permanece na tela de entrar', async ({ page }) => {
    await clearAppStorage(page);
    await page.goto('/entrar');
    await waitForAppReady(page);
    await page.getByLabel('E-mail').fill(DEMO_EMAIL);
    await page.getByLabel('Senha').fill('senha-errada');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL(/\/entrar\/?$/);
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  });

  test('painel exige login', async ({ page }) => {
    await clearAppStorage(page);
    await page.goto('/painel');
    await expect(page).toHaveURL(/\/entrar\/?$/);
    await waitForAppReady(page);
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  });

  test('link Entrar na boas-vindas abre o login', async ({ page }) => {
    await clearAppStorage(page);
    await page.goto('/bem-vindo');
    await page.getByRole('link', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL(/\/entrar\/?$/);
    await waitForAppReady(page);
    await expect(page.getByLabel('E-mail')).toHaveValue(DEMO_EMAIL);
  });

  test('já onboarded ainda acessa /entrar sem o gate', async ({ page }) => {
    await skipGuestGate(page);
    await page.goto('/entrar');
    await waitForAppReady(page);
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
    await expect(page).toHaveURL(/\/entrar\/?$/);
  });
});
