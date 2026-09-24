import { expect, type Page } from '@playwright/test';

/** Matches `GUEST_ONBOARDED_KEY` in `frontend/src/lib/guest.ts`. */
export const GUEST_ONBOARDED_KEY = 'tempro.guestOnboarded';

export const DEMO_EMAIL = 'joao@tempro.local';
export const DEMO_PASSWORD = 'joao1234';

/**
 * Marks the guest gate as already seen before any navigation. Without this,
 * `/` redirects to `/bem-vindo` and every public-screen test would have to
 * walk the onboarding carousel first.
 */
export async function skipGuestGate(page: Page) {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, '1');
  }, GUEST_ONBOARDED_KEY);
}

/**
 * Wipes auth + guest flags once. Uses a real navigation so `localStorage`
 * has an origin — an `addInitScript` that clears on every load would log the
 * person out again the moment a later `goto` ran after login.
 */
export async function clearAppStorage(page: Page) {
  await page.goto('/bem-vindo');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
}

/**
 * Waits out the bootstrap splash ("Carregando o TemPro…"). Catalog-backed
 * pages stay behind it until `/api/bootstrap` lands.
 */
export async function waitForAppReady(page: Page) {
  await expect(
    page.getByRole('heading', { name: /Carregando o TemPro/i }),
  ).toHaveCount(0, { timeout: 30_000 });
}

export async function loginAsDemo(page: Page) {
  await page.goto('/entrar');
  await waitForAppReady(page);
  await page.getByLabel('E-mail').fill(DEMO_EMAIL);
  await page.getByLabel('Senha').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/painel\/?$/);
}
