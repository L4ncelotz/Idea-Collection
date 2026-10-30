import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/.auth/user.json' })

const title = (tag: string) => `E2E TinyDiff ${tag} ${Date.now()}`

/**
 * Full idea lifecycle against a real Supabase backend:
 * create → see it in list & search → edit README/preview → change status →
 * verify persisted → delete with confirmation.
 * Runs as a single test so the vault stays clean even if a step fails midway.
 */
test('idea lifecycle', async ({ page }) => {
  const ideaTitle = title('run')

  // ---- Create via New Idea modal (no README needed — spec: fast capture) ----
  await page.goto('/')
  await page.getByRole('button', { name: 'New Idea' }).click()
  await page.getByLabel('Title *').fill(ideaTitle)
  await page.getByLabel('Description').fill('E2E: comparing two texts and highlighting lines difference')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText(ideaTitle)).toBeVisible()
  await expect(page.getByText('Idea', { exact: true })).toBeVisible()

  // ---- Search finds it ----
  await page.getByPlaceholder(/search/i).fill('highlighting lines difference')
  await expect(page.getByText(ideaTitle)).toBeVisible()
  await page.getByPlaceholder(/search/i).fill(ideaTitle + 'zzz')
  await expect(page.getByText(/no ideas match/i)).toBeVisible()
  await page.getByPlaceholder(/search/i).fill('')

  // ---- Open detail, write README, toggle preview ----
  await page.getByText(ideaTitle).first().click()
  await expect(page.getByRole('heading', { name: 'README' })).toBeVisible()

  page.getByLabel('README content').fill('# Focus\n\n## Concept\ncompare text') // via codeMirror textarea
  await page.getByRole('button', { name: 'Preview' }).click()
  await expect(page.getByRole('heading', { name: 'Concept' })).toBeVisible()

  // ---- Change status to Building and save ----
  await page.getByRole('radio', { name: 'Building' }).click()
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Saved')).toBeVisible({ timeout: 10_000 })

  // ---- Back to list: badge persisted ----
  await page.getByRole('button', { name: /your ideas/i }).click()
  const card = page.locator('a', { hasText: ideaTitle })
  await expect(card.getByText('Building')).toBeVisible()

  // ---- Delete with typed confirmation ----
  await card.click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByLabel(/type the idea title/i).fill(ideaTitle)
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByRole('heading', { name: 'Your Ideas' })).toBeVisible()
  await expect(page.getByText(ideaTitle)).toHaveCount(0)
})
