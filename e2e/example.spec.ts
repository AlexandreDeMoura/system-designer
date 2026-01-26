import { test, expect } from '@playwright/test'

test.describe('System Designer', () => {
  test('loads the home page', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByRole('heading', { name: 'Web App Technical Decisions' })).toBeVisible({
      timeout: 20_000,
    })
    await expect(page).toHaveTitle(/system-designer/i)
  })
})
