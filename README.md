# CommBox QA Home Assignment — Messaging App Tests

[![Playwright Tests](https://github.com/shvydak/commbox-home-assignment/actions/workflows/playwright.yml/badge.svg)](https://github.com/shvydak/commbox-home-assignment/actions/workflows/playwright.yml)

A small Playwright + TypeScript test framework for a mocked messaging app.

There is no real backend. The app makes a real `fetch()` call, and Playwright's `page.route()`
replaces the response during tests — see [Decisions & reasoning](#decisions--reasoning) below.

## Setup

**Requirements:** Node.js 20 or later. Check your version with `node -v`. Nothing else is needed — no database, no global installs. If you use [nvm](https://github.com/nvm-sh/nvm), running
`nvm use` in this folder picks the right Node version automatically (see `.nvmrc`).

```bash
git clone <repo-url>
cd commbox-home-assignment
npm install
npx playwright install
```

`package-lock.json` is committed, so `npm install` resolves the exact dependency versions used here.

If `npx playwright install` fails on a fresh Linux machine (missing system libraries), run
`npx playwright install --with-deps` instead.

### Run the tests

```bash
npm test
```

This one command does everything: it starts a local static server, runs all tests in Chromium,
Firefox, and WebKit, and stops the server when done. No separate steps, nothing to run in another
terminal.

### View the report

```bash
npm run report
```

Opens Playwright's HTML report in your browser. It includes a trace viewer and screenshots for any test.

### Other useful commands

```bash
npm run test:headed   # run with a visible browser window
npm run test:ui       # Playwright's interactive UI mode
npm run type-check    # TypeScript check
npm run lint          # ESLint
npm run format        # Prettier
```

### View the CI report

Every push, pull request, and manual run (Actions tab → **Playwright Tests** → **Run workflow**)
produces a report too, in two forms:

- **Live, no download needed:** https://shvydak.github.io/commbox-home-assignment/ — always the
  latest run on `main`.
- **Downloadable, per run:** open a run under the
  [Actions tab](https://github.com/shvydak/commbox-home-assignment/actions), download the
  `playwright-report` artifact, unzip it, open `index.html`.

### Live test dashboard

This project also reports to a full test dashboard I
built myself: [**test-dashboard.shvydak.com**](https://test-dashboard.shvydak.com) (source:
[yshvydak-test-dashboard](https://github.com/shvydak/yshvydak-test-dashboard)).

What it adds on top of the native HTML reporter above:

- **History across runs** — the native reporter is overwritten every run; the dashboard keeps all
  of them, so trends and flaky tests are visible over time, not just the latest pass/fail.
- **Live results while a run is still going**, streamed over WebSocket, instead of a report you
  only see after the whole suite finishes.
- **Trigger a run from the browser** — a single test, a group, or the whole suite, no terminal,
  no waiting on CI.

It stays in sync automatically on every push to `main`, so the dashboard always runs the latest
commit, not a stale one.

`playwright-dashboard-reporter` in `package.json` is for this: the dashboard passes it as the
reporter when it runs tests. It isn't in `playwright.config.ts` — a local or CI run never uses it.

Login is required — credentials are included in my submission email.

## AI tools used

Built with [Claude Code](https://claude.com/claude-code) — used for drafting code, reviewing it
against this project's conventions, and catching issues before they'd reach a test run.

All final decisions — what to build, what to cut, what to test, and what to refactor — were mine.

## Decisions & reasoning

These patterns come from a production test suite I maintain at work, deliberately scaled down for
a small, mock-backed project — not carried over wholesale.

### Mocking (`e2e/mocks/sendMessage.mock.ts`)

- `page.route()` mocks the one API call the app makes (`POST /api/send-message`) — a success
  response, and a 500 error as the creative enhancement, chosen over a delay since it adds real
  coverage of the app's `catch` block and error banner.

### Test structure (`e2e/tests/send-message.spec.ts`, `e2e/pages/messaging.page.ts`)

- One Page Object (`MessagingPage`), one action (`sendMessage`) — no extra builders or fixtures;
  this suite is too small to need them yet.
- `waitForResponseDuring` (`e2e/testUtils/playwright.utils.ts`) fixes a real race condition:
  `locator.click()` resolves before the app finishes handling the response, so sending messages
  back-to-back failed intermittently without it.
- `expect.soft()` everywhere — collects every mismatch in one run instead of stopping at the first.
- Runs on Chromium, Firefox, and WebKit — CommBox is omnichannel, so its users are realistically
  spread across browsers.

### Tooling

- ESLint — catches likely bugs and bad patterns before they reach a test run.
- Prettier — keeps code formatting consistent.
- TypeScript type-check — catches type errors early.

### CI & reporting (`.github/workflows/playwright.yml`)

- GitHub Actions runs the suite on every push and pull request to `main`, plus a manual trigger.
- Report published to GitHub Pages instead of Allure — a native GitHub feature, no extra account
  or service needed.

## Future improvements

Things I would add in a larger project, deliberately skipped here because the current test count
doesn't justify them yet:

- Shared helper methods for repeated checks or setup (e.g., verifying a table row's contents,
  building common test data), once the same one is needed across many tests, not just one or two.
- If a real backend existed: create test data through API calls before each test instead of
  clicking through the UI, but only for setup steps that already have their own UI test elsewhere
  — an API shortcut should never be the only proof that a flow actually works.
- A contract check between what the frontend sends and what the backend returns, so an API change
  that breaks the format gets caught by a test, not discovered in production.
- Tags (e.g. `@smoke`) to run a subset of tests.
- Lint/type-check/format as a pre-push git hook, catching issues before they even reach CI.
