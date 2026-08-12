import type {Locator, Page} from '@playwright/test'

// README: scaled-down seed of probuild-qa's `waitForRequestAndResponse` (e2e/testUtils/
// playwright.utils.ts there) — same idea (click a locator, wait for the matching
// response, not just for the click to dispatch), but without method/status/timeout
// config or soft-fail-to-null, because there's exactly one endpoint and one caller
// here. Pulled into its own file anyway, not left inline in the page object, because
// this exact mistake (waiting on the click instead of the response) is easy to repeat
// the moment a second action needs the same wait — found the hard way via a real
// race condition, not speculative. Grow this toward the full utility if/when that
// second caller shows up; don't rebuild the config knobs before then.
export async function waitForResponseDuring(page: Page, url: string, locator: Locator) {
    const response = page.waitForResponse(url)
    await locator.click()
    return response
}
