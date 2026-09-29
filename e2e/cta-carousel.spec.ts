import { test, expect } from '@playwright/test';

import { skipGuestGate, waitForAppReady } from './helpers';

/* The config runs with reduced motion, which turns the autoplay off. */
test.use({ reducedMotion: 'no-preference' });

test('carrossel de convites avança sozinho', async ({ page }) => {
  await skipGuestGate(page);
  await page.goto('/');
  await waitForAppReady(page);

  const dots = page.getByRole('tablist', { name: 'Convites' });
  const provider = dots.getByRole('tab', { name: 'Você presta serviços?' });
  const invite = dots.getByRole('tab', { name: 'Conhece algum prestador?' });

  await expect(provider).toHaveAttribute('aria-selected', 'true');
  await expect(invite).toHaveAttribute('aria-selected', 'true', {
    timeout: 6_000,
  });
  await expect(provider).toHaveAttribute('aria-selected', 'true', {
    timeout: 6_000,
  });
});
