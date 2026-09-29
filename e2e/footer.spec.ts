import { test, expect } from '@playwright/test';

import { skipGuestGate, waitForAppReady } from './helpers';

test.describe('footer', () => {
  test.beforeEach(async ({ page }) => {
    await skipGuestGate(page);
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('mostra os contatos', async ({ page }) => {
    const footer = page.getByRole('contentinfo');

    await expect(
      footer.getByRole('link', { name: 'augusto.kersting@gmail.com' }),
    ).toHaveAttribute('href', 'mailto:augusto.kersting@gmail.com');
    await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/augusto-kersting-fagundes/',
    );
  });

  test('não lista categorias nem a região', async ({ page }) => {
    const footer = page.getByRole('contentinfo');

    await expect(footer.getByRole('navigation', { name: 'Categorias' })).toHaveCount(0);
    await expect(footer).not.toContainText('Vale do Rio Pardo');
  });
});
