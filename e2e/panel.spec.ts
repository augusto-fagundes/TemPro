import { test, expect } from '@playwright/test';

import { clearAppStorage, loginAsDemo } from './helpers';

test.describe('painel do prestador', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
    await loginAsDemo(page);
  });

  test('visão geral mostra perfil e serviços', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^Olá,/ })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Meu perfil', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Meus serviços', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Visualizar meu perfil público' }),
    ).toBeVisible();
  });

  test('navega para meus serviços pela barra lateral', async ({ page }) => {
    await page
      .getByRole('navigation', { name: 'Painel do prestador' })
      .getByRole('link', { name: 'Meus serviços' })
      .click();
    await expect(page).toHaveURL(/\/painel\/servicos\/?$/);
    await expect(
      page.getByRole('heading', { name: 'Meus serviços' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: '+ Novo serviço' }),
    ).toBeVisible();
  });

  test('abre a edição do perfil', async ({ page }) => {
    await page.getByRole('link', { name: 'Editar perfil' }).click();
    await expect(page).toHaveURL(/\/painel\/perfil\/?$/);
    await expect(
      page.getByRole('heading', { name: /perfil/i }).first(),
    ).toBeVisible();
  });

  test('menu no celular lista as telas do painel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('heading', { name: /^Olá,/ })).toBeVisible();

    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await expect(
      page.getByRole('menuitem', { name: 'Visão geral' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Meus serviços' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Meu perfil' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Sair' }),
    ).toBeVisible();

    await page.getByRole('menuitem', { name: 'Meus serviços' }).click();
    await expect(page).toHaveURL(/\/painel\/servicos\/?$/);
  });
});
