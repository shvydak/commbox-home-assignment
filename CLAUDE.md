# CLAUDE.md

Playwright + TypeScript mini test framework for CommBox's QA home assignment (First Task).
No real backend — `app/messaging-app.html` is a hand-built fixture (own version, not the
originally provided dummy file), styled after commbox.io branding.

## Commands

- `npm run type-check` / `type-check:watch` — tsc supports `--watch`
- `npm run lint` / `lint:fix` — ESLint has **no** `--watch` flag, don't add one
- `npm run format` / `format:check` — Prettier (4-space indent, no semicolons, single
  quotes, `bracketSpacing: false` — a personal style preference, not Prettier's default)
- `npm test` — `webServer` in playwright.config.ts auto-starts scripts/static-server.js,
  no manual server step needed
- Before calling a change done: `npx tsc --noEmit && npx eslint . && npx prettier --check . && npx playwright test`

## Gotchas

- `typescript-eslint@8.x` only supports `typescript <6.1.0`; TS 7 is npm "latest" and
  breaks `npm install` with an ERESOLVE conflict. Keep `typescript` pinned to `6.0.3`
  (or the newest `<6.1.0`) until typescript-eslint catches up.
- Use `defineConfig` from `eslint/config` (ESLint core) in eslint.config.mjs, not
  `tseslint.config()` — the latter is deprecated in favor of the former.
- `app/messaging-app.html` only works when driven by Playwright with
  `page.route('**/api/send-message', ...)` mocking the fetch — opening it directly
  (`file://` or a plain browser tab) will not work: no backend exists, and `file://`
  blocks `fetch()` regardless. For a manual/visual check outside a test, serve it via
  `node scripts/static-server.js` and override `window.fetch` in the devtools console.
- Locators use `data-testid` (`message-input`, `send-button`, `message-list`,
  `message-item`, `error-banner`, `char-count`) — add one when extending the app,
  don't select on CSS classes/ids.
- No Python anywhere in this project by design — Node-only tooling, so `npm install`
  is the single dependency story for anyone cloning the repo.
- Node version pinned two places — `.nvmrc` (20) and `engines.node` in package.json —
  keep them in sync if bumping.
- `.vscode/tasks.json`'s TYPE-CHECK task has no `runOptions.runOn: folderOpen` — removed
  on purpose. It ran `tsc` on every folder open, which fails loudly (`tsc: command not
found`) on a fresh clone opened in the editor before `npm install`. Unlike an
  actively-developed repo where `node_modules` is basically always installed, a
  first-time reviewer here may open the folder before running setup. Task still works
  on demand via Command Palette → Tasks: Run Task; don't re-add the auto-trigger.
- `Locator.click()` resolves once the click dispatches, not once the app's `async`
  submit handler finishes. Chaining actions that each trigger a fetch (e.g. sending
  several messages back-to-back) can race the app's own state reset and fail
  intermittently. Use `waitForResponseDuring` (`e2e/testUtils/playwright.utils.ts`)
  instead of a bare `.click()` for any action that should wait for the mocked response.
- `.github/workflows/playwright.yml`'s `deploy` job (publishes the HTML report to
  GitHub Pages) only works from the default branch. GitHub's auto-created
  `github-pages` environment blocks deploys from any other branch by default
  ("not allowed to deploy... due to environment protection rules") — hit this
  pushing from `develop` before switching the trigger to `main`. Also needs a
  one-time manual step first: repo Settings → Pages → Source → "GitHub Actions".
- CI's `npx playwright install --with-deps` has no browser argument on purpose — it
  installs every browser in `playwright.config.ts`'s `projects` list (currently
  chromium, firefox, webkit). If that list ever shrinks, filter the install too
  (e.g. `--with-deps chromium`) or CI wastes time on browsers nothing tests against.
- CI logs may show "Node.js 20 is deprecated" warnings from `actions/upload-artifact`/
  `actions/deploy-pages` — that's those actions' own internal runtime (GitHub forces
  Node 24), unrelated to this project's `.nvmrc` (still 20 on purpose). Not
  actionable, safe to ignore.

## Testing Conventions

- `expect.soft()` everywhere in `e2e/tests/` — collects every mismatch in one run
  instead of stopping at the first failure.
- No `testData` builder, `flow` wrapper file, or custom Playwright fixture in this
  suite — deliberately. Each was tried and removed for having exactly one caller; add
  one only once a second real caller appears (see top-of-file comment in
  `send-message.spec.ts`).
- Before trusting a new or tricky assertion (`toMatchAriaSnapshot`, order-sensitive
  `toHaveText` arrays, boundary conditions), temporarily break the expected value and
  confirm the test actually fails, then restore it — don't assume a matcher
  discriminates correctly just because it passes once.
- `// README:` comments mark content meant for README.md's "Decisions & reasoning" —
  grep `README:` across the repo when writing/updating the README, then remove the
  markers once transcribed.
- `npm install` in README.md (human setup docs — the common convention reviewers
  expect); `npm ci` reserved for the GitHub Actions workflow (`.github/workflows/
playwright.yml`) — each command lives where it's conventionally expected, not
  swapped for "more correct."
