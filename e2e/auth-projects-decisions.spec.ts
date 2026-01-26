import { expect, test, type Locator, type Page } from '@playwright/test'

const E2E_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
} as const

async function signInWithEmail(page: Page) {
  const signInButton = page.getByRole('button', { name: 'Sign in' })
  await expect(signInButton).toBeEnabled()
  await signInButton.click()

  const authForm = page.locator('form', { has: page.getByLabel('Email') })
  await authForm.getByLabel('Email').fill(E2E_USER.email)
  await authForm.getByLabel('Password').fill(E2E_USER.password)

  await authForm.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
}

async function createProject(page: Page, projectName: string) {
  await page.getByRole('button', { name: 'Projects' }).click()
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()

  await page.getByRole('button', { name: 'Create Project' }).click()

  await page.getByLabel('Name').fill(projectName)
  await page.getByRole('button', { name: 'Create' }).click()

  const projectButton = page.getByRole('button', { name: new RegExp(projectName) })
  await expect(projectButton).toBeVisible()
  await projectButton.click()

  await expect(page.getByRole('heading', { name: 'Projects' })).toBeHidden()
}

function getDecisionCardById(page: Page, decisionId: string): Locator {
  return page
    .locator('.decision-card', { has: page.getByText(decisionId, { exact: true }) })
    .first()
}

function getOptionSummaryByName(decisionCard: Locator, optionName: string): Locator {
  return decisionCard
    .locator('summary.option-row')
    .filter({ hasText: optionName })
    .first()
}

test.describe('Auth → Projects → Decision persistence', () => {
  test('persists a decision selection across reload', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Web App Technical Decisions' })
    ).toBeVisible({ timeout: 30_000 })

    await signInWithEmail(page)

    const projectName = `E2E Project ${Date.now()}`
    await createProject(page, projectName)

    const firstDecisionCard = page.locator('.decision-card').first()
    await firstDecisionCard.scrollIntoViewIfNeeded()

    const decisionId = (await firstDecisionCard.locator('span.font-mono').first().innerText()).trim()

    await firstDecisionCard.click()
    await expect(firstDecisionCard.getByRole('heading', { name: 'Options' })).toBeVisible()

    const firstOptionSummary = firstDecisionCard.locator('summary.option-row').first()
    const optionName = (await firstOptionSummary.locator('span').nth(1).innerText()).trim()

    await firstOptionSummary.click()

    const selectButton = firstDecisionCard.getByRole('button', { name: 'Select this option' })
    await expect(selectButton).toBeVisible()

    await selectButton.click()

    await expect(firstOptionSummary.getByText('Selected', { exact: true })).toBeVisible({
      timeout: 15_000,
    })

    await page.reload()
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: 'Projects' }).click()
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()
    const projectButton = page.getByRole('button', { name: new RegExp(projectName) })
    await expect(projectButton).toBeVisible()
    await projectButton.click()
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeHidden()

    const decisionCardAfterReload = getDecisionCardById(page, decisionId)
    await decisionCardAfterReload.scrollIntoViewIfNeeded()
    await decisionCardAfterReload.click()

    const optionSummaryAfterReload = getOptionSummaryByName(decisionCardAfterReload, optionName)
    await expect(optionSummaryAfterReload.getByText('Selected', { exact: true })).toBeVisible({
      timeout: 15_000,
    })

    await optionSummaryAfterReload.click()
    const clearButton = decisionCardAfterReload.getByRole('button', { name: 'Clear selection' })
    await clearButton.click()

    await expect(optionSummaryAfterReload.getByText('Selected', { exact: true })).toHaveCount(0, {
      timeout: 15_000,
    })
  })
})
