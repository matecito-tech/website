import { defineConfig, devices } from '@playwright/test';

// Pruebas de punta a punta contra el build de producción (astro preview).
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4329',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'bun run preview --port 4329 --ignore-lock',
    url: 'http://localhost:4329',
    reuseExistingServer: !process.env.CI,
  },
});
