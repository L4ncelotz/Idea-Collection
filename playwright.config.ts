import { defineConfig, devices } from '@playwright/test'

/**
 * E2E requires a configured `.env.local` (Supabase project) and a one-time
 * manual Google login. See docs/SETUP.md → "Run the E2E tests".
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: false, // one account, shared database — keep runs sequential
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'auth',
      testMatch: 'auth.setup.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'app',
      dependencies: ['auth'],
      testIgnore: 'auth.setup.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user.json',
      },
    },
  ],
})
