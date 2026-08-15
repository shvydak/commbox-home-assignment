import {type Page} from '@playwright/test'

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
