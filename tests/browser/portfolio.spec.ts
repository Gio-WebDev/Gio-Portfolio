import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import assets from '../../src/data/assets.generated.json' with { type: 'json' }

test('portfolio has no overflow or runtime errors and exposes all verified projects', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Thoughtful',
  )
  await expect(page.locator('.project-card')).toHaveCount(4)
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  }
  await page.setViewportSize(
    testInfo.project.name === 'mobile'
      ? { width: 393, height: 851 }
      : { width: 1440, height: 1000 },
  )
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true)
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({
    path: `artifacts/${testInfo.project.name}-home.png`,
    fullPage: false,
  })
  expect(errors).toEqual([])
  expect(
    await page
      .locator('img')
      .evaluateAll((images) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
  ).toBe(true)
})

test('project filtering, case-study links, Escape, focus restoration, and history work', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Educational', exact: true }).click()
  await expect(page.locator('.project-card')).toHaveCount(1)
  await expect(page.locator('.project-card')).toContainText('Rizal')
  await page.getByRole('button', { name: /All projects/ }).click()
  const trigger = page.getByRole('button', { name: 'View POSEIDON case study' })
  await trigger.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(page).toHaveURL(/project=poseidon/)
  await expect(
    dialog.getByRole('heading', { name: 'POSEIDON', exact: true }),
  ).toBeVisible()
  await expect(
    dialog.getByText('Academic capstone · Three-member team', { exact: true }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await page.goBack()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: /Next project/ }).click()
  await expect(
    page
      .getByRole('dialog')
      .getByRole('heading', { name: 'HANAP', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Close case study' }).click()
})

test('navigation and honest resume/contact states work', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Open navigation' }).click()
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeVisible()
  }
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Resume', exact: true })
    .click()
  if (assets.resume) {
    await expect(page.getByText('ATS resume · PDF · No photo')).toBeInViewport()
    await page.getByRole('button', { name: 'View resume', exact: true }).click()
    await expect(page.getByLabel('Gio Lopez resume PDF')).toHaveAttribute('data', assets.resume)
    const pdf = await page.request.get(assets.resume)
    expect(pdf.ok()).toBe(true)
    expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-')
    const downloadEvent = page.waitForEvent('download')
    await page.locator('#resume a[download]').first().click()
    const download = await downloadEvent
    expect(download.suggestedFilename()).toBe('Gio_Resume_ATS_No_Photo.pdf')
    await page.getByRole('button', { name: 'Close preview', exact: true }).click()
  } else {
    await expect(page.getByText('PDF not available yet')).toBeInViewport()
    await expect(page.locator('#resume a[download]')).toHaveCount(0)
  }
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Open navigation' }).click()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Contact', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Sending is not configured' }),
  ).toBeDisabled()
  await expect(
    page.getByText('The form isn’t accepting messages yet.', { exact: false }),
  ).toBeVisible()
  await expect(
    page.locator('#contact a[href="mailto:lopezjgm999@gmail.com"]').first(),
  ).toBeVisible()
  await expect(page.locator('#contact .email-link')).toBeInViewport()
  await expect(
    page.locator('#main-navigation a[href="#contact"]'),
  ).toHaveAttribute('aria-current', 'location')
})

test('contact request prevents double sends and surfaces provider rejection', async ({
  page,
}) => {
  let posts = 0
  const submissionIds: string[] = []
  let releaseFirstRequest!: () => void
  const pendingFirstRequest = new Promise<void>((resolve) => {
    releaseFirstRequest = resolve
  })
  await page.route('**/api/contact', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { configured: true } })
      return
    }
    posts++
    submissionIds.push(route.request().postDataJSON().submissionId)
    if (posts === 1) {
      await pendingFirstRequest
      await route.fulfill({
        status: 502,
        json: { error: 'Provider rejected the message.' },
      })
    } else {
      await route.fulfill({ json: { success: true } })
    }
  })
  await page.goto('/#contact')
  await page.getByLabel('Your name', { exact: true }).fill('Alex Smith')
  await page.getByLabel('Email address').fill('alex@example.com')
  await page.getByLabel('Subject', { exact: true }).fill('Internship')
  await page
    .getByLabel('Your message', { exact: true })
    .fill('Hello Gio, we would like to talk about an internship.')
  const send = page.getByRole('button', { name: 'Send message', exact: true })
  await expect(send).toBeEnabled()
  await send.click()
  await expect(page.getByRole('button', { name: 'Sending your message…' })).toBeDisabled()
  await expect.poll(() => posts).toBe(1)
  // Bypass the disabled button to ensure concurrent form events cannot double-send.
  await page.locator('.contact-form').evaluate((form: HTMLFormElement) => form.requestSubmit())
  releaseFirstRequest()
  await expect(page.getByRole('alert')).toContainText('Provider rejected')
  expect(posts).toBe(1)
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue(
    'Alex Smith',
  )
  await expect(send).toBeEnabled()
  await send.click()
  await expect(page.locator('.form-feedback.success')).toContainText('accepted by the email service')
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('')
  expect(posts).toBe(2)
  expect(submissionIds[0]).toBe(submissionIds[1])
})

test('homepage and case study pass WCAG 2.2 AA automated checks', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(
    page.getByRole('button', { name: 'Sending is not configured' }),
  ).toBeDisabled()
  const homeResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(
    homeResults.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => ({
        target: node.target,
        failure: node.failureSummary,
      })),
    })),
  ).toEqual([])
  await page.getByRole('button', { name: 'View POSEIDON case study' }).click()
  const dialogResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(
    dialogResults.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => ({
        target: node.target,
        failure: node.failureSummary,
      })),
    })),
  ).toEqual([])
})
