import type {Locator, Page} from '@playwright/test'

export async function waitForResponseDuring(page: Page, url: string, locator: Locator) {
    const response = page.waitForResponse(url)
    await locator.click()
    return response
}
