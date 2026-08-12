import {type Page, type Locator} from '@playwright/test'
import {waitForResponseDuring} from '../testUtils/playwright.utils'

export const ERROR_BANNER_TEXT = 'Failed to send message. Please try again.'

export class MessagingPage {
    readonly page: Page
    readonly messageInput: Locator
    readonly sendButton: Locator
    readonly messageList: Locator
    readonly errorBanner: Locator
    readonly charCount: Locator

    constructor(page: Page) {
        this.page = page
        this.messageInput = page.getByTestId('message-input')
        this.sendButton = page.getByTestId('send-button')
        this.messageList = page.getByTestId('message-list')
        this.errorBanner = page.getByTestId('error-banner')
        this.charCount = page.getByTestId('char-count')
    }

    async goto() {
        await this.page.goto('/')
    }

    async sendMessage(message: string) {
        await this.messageInput.fill(message)
        await waitForResponseDuring(this.page, '**/api/send-message', this.sendButton)
    }

    messages(): Locator {
        return this.messageList.getByTestId('message-item')
    }
}
