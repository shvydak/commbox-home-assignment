import {defineConfig, devices} from '@playwright/test'

const PORT = 4173

export default defineConfig({
    testDir: './e2e/tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : 4,

    reporter: [['html', {open: 'never'}], ['list']],

    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'on',
        screenshot: {
            mode: 'on',
            fullPage: true,
        },
        video: 'on',
    },

    projects: [
        {name: 'chromium', use: {...devices['Desktop Chrome']}},
        {name: 'firefox', use: {...devices['Desktop Firefox']}},
        {name: 'webkit', use: {...devices['Desktop Safari']}},
    ],

    // Serves app/messaging-app.html — Playwright starts/stops it automatically,
    // no manual step and no dependency beyond Node itself.
    webServer: {
        command: 'node scripts/static-server.js',
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        env: {PORT: String(PORT)},
    },
})
