import {test, expect} from '@playwright/test'
import {ERROR_BANNER_TEXT, MessagingPage} from '../pages/messaging.page'
import {mockSendMessageSuccess, mockSendMessageError} from '../mocks/sendMessage.mock'

test.describe('Send message', () => {
    let messagingPage: MessagingPage

    test.beforeEach(async ({page}) => {
        messagingPage = new MessagingPage(page)
        await messagingPage.goto()
    })

    test.describe('happy path', () => {
        test.beforeEach(async ({page}) => {
            await mockSendMessageSuccess(page)
        })

        test('typed message appears in the list and input clears', async () => {
            const messageText = 'Hey, is anyone there?'

            await messagingPage.sendMessage(messageText)

            await expect.soft(messagingPage.messages()).toMatchAriaSnapshot(`- listitem: ${messageText}`)
            await expect.soft(messagingPage.messageInput).toBeEmpty()
        })

        test('sends multiple messages and keeps them in order', async () => {
            const firstMessage = 'First message'
            const secondMessage = 'Second message'
            const thirdMessage = 'Third message'

            await messagingPage.sendMessage(firstMessage)
            await messagingPage.sendMessage(secondMessage)
            await messagingPage.sendMessage(thirdMessage)

            await expect
                .soft(messagingPage.messages())
                .toHaveText([firstMessage, secondMessage, thirdMessage])
        })

        test('renders message content as plain text, not HTML', async () => {
            const xssPayload = '<img src=x onerror="window.__xssFired = true">'
            await messagingPage.sendMessage(xssPayload)

            await expect.soft(messagingPage.messages()).toHaveText([xssPayload])

            // Rendered via textContent, not innerHTML — no actual <img> element created,
            // so the payload can't execute (see onerror handler above).
            await expect.soft(messagingPage.messageList.locator('img')).toHaveCount(0)
        })
    })

    test.describe('error handling', () => {
        test.beforeEach(async ({page}) => {
            await mockSendMessageError(page)
        })

        test('shows an error and preserves the typed text when the API call fails', async () => {
            const messageText = 'This will fail'

            await messagingPage.sendMessage(messageText)

            await expect.soft(messagingPage.errorBanner).toBeVisible()
            await expect.soft(messagingPage.errorBanner).toHaveText(ERROR_BANNER_TEXT)
            await expect.soft(messagingPage.messages()).toHaveCount(0)
            await expect.soft(messagingPage.messageInput).toHaveValue(messageText)
        })
    })

    test.describe('input validation', () => {
        test('Send button is disabled for empty or whitespace-only input', async () => {
            await expect.soft(messagingPage.sendButton).toBeDisabled()

            await messagingPage.messageInput.fill('   ')
            await expect.soft(messagingPage.sendButton).toBeDisabled()

            await messagingPage.messageInput.fill('Hello')
            await expect.soft(messagingPage.sendButton).toBeEnabled()
        })

        test('stays enabled at the character limit and disables just over it', async () => {
            const charLimit = 200
            const messageAtLimit = 'a'.repeat(charLimit)
            const messageOverLimit = 'a'.repeat(charLimit + 1)

            await messagingPage.messageInput.fill(messageAtLimit)
            await expect.soft(messagingPage.sendButton).toBeEnabled()
            await expect.soft(messagingPage.charCount).toHaveText(`${messageAtLimit.length}/${charLimit}`)
            await expect.soft(messagingPage.charCount).not.toHaveClass(/chat__count--over/)

            await messagingPage.messageInput.fill(messageOverLimit)
            await expect.soft(messagingPage.sendButton).toBeDisabled()
            await expect.soft(messagingPage.charCount).toHaveText(`${messageOverLimit.length}/${charLimit}`)
            await expect.soft(messagingPage.charCount).toHaveClass(/chat__count--over/)
        })
    })
})
