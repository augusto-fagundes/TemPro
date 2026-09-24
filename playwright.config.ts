import { defineConfig, devices } from '@playwright/test';

const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3333';

/**
 * E2E against the real monorepo stack: Express API + Vite, with `/api`
 * proxied the same way as day-to-day `npm run dev`.
 *
 * Expects a seeded database (demo user `joao@tempro.local` / `joao1234`).
 * Reuses servers already running locally; starts both in CI.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    /* Count-up and hero staggers are decoration; reduced motion keeps
       assertions about visible text from racing the animation frame. */
    reducedMotion: 'reduce',
    locale: 'pt-BR',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev:api',
      url: `${API_URL}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        PW_TEST: '1',
      },
    },
    {
      command: 'npm run dev:web',
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        PW_TEST: '1',
        CI: process.env.CI ?? '',
      },
    },
  ],
});
