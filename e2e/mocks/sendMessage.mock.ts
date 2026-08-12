import {type Page} from '@playwright/test'

// README: no backend exists at all — page.route() intercepts the real fetch() call
// the app makes and fakes the response, per requirement #4. Kept as standalone
// exported functions (not class methods, not a fixture) — reused as-is by every
// describe block that needs a given response shape, nothing more elaborate earns
// its keep at this test count.

// Simulates the message-send API (no real backend) — echoes the sent text back
// on success, the same contract the real fetch call in messaging-app.html expects.
export const mockSendMessageSuccess = async (page: Page) => {
    await page.route('**/api/send-message', async (route) => {
        const {message} = route.request().postDataJSON()
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({success: true, message}),
        })
    })
}

// Simulates a server error (e.g. the app's send-message endpoint is down).
export const mockSendMessageError = async (page: Page) => {
    await page.route('**/api/send-message', async (route) => {
        await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({success: false}),
        })
    })
}
