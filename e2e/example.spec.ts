import { test, expect } from '@playwright/test'

test.describe('System Designer', () => {
  test('loads the home page', async ({ page }) => {
    await page.goto('/')
    
    // Wait for the app to be ready
    await expect(page.locator('body')).toBeVisible()
    
    // Verify the app has loaded by checking for the page title
    await expect(page).toHaveTitle(/system-designer/i)
  })
})

