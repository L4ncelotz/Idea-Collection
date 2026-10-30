import { test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const AUTH_FILE = path.join(__dirname, '.auth', 'user.json')

/**
 * One-time, human-assisted login:
 * Playwright opens the real Google OAuth popup — you finish it by hand.
 * The resulting session is saved to tests/.auth/user.json and reused by the
 * 'app' project so idea flows never need login automation.
 */
test('sign in via Google (human-assisted)', async ({ page }) => {
  mkdirSync(path.dirname(AUTH_FILE), { recursive: true })

  await page.goto('/login')
  await page.getByRole('button', { name: /sign in with google/i }).click()

  // The human completes whatever Google shows (account picker).
  // We wait until the app itself considers us signed-in.
  await page.waitForURL('http://localhost:3000/', { timeout: 120_000 })

  await page.context().storageState({ path: AUTH_FILE })
})
