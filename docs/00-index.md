# Histrion — Documentation

> [!tip] The Golden Rule
> **Tests never contain selectors.** They read like specifications.
>
> ```typescript
> // Good : reads like a spec
> test('user can log in', async ({ loginPage }) => {
>   await loginPage.navigate();
>   await loginPage.fillCredentials({ username: 'user@test.com', password: 's3cret' });
>   await loginPage.submit();
>   await loginPage.expectDashboard();
> });
>
> // Bad : implementation details leaked into the test
> test('user can log in', async ({ page }) => {
>   await page.fill('#username', 'user@test.com');
>   await page.fill('#password', 's3cret');
>   await page.click('button[type="submit"]');
> });
> ```
>
> If you see a `page.click()` or a `data-testid` in a test file, something went wrong.

## Guides

| # | Guide | What you'll learn |
|---|-------|-------------------|
| 01 | getting-started | Run your first test, available scripts, project structure, targeting environments |
| 02 | architecture| The 7-layer architecture, dependency rules, where things go |
| 03 | page-objects | Create a Page Object from scratch in 6 steps |
| 04 | components| Build reusable UI components shared across pages |
| 05 | fixtures | How Playwright fixtures inject Page Objects into tests |
| 06 | data-builders | Fluent builder pattern for type-safe test data |
| 07 | api-helpers| Skip the UI for test setup/teardown with API clients |
| 08 | visual-regression| Screenshot comparison, masking, baseline management |
| 09 | configuration | Environments, test users, Playwright projects, auth caching |
| 10 | custom-matchers | Domain-specific assertions with `expect.extend` |
| 11 | ci-cd| GitHub Actions workflow, secrets, artifacts, reports |
| 12 | best-practices | Golden rules, tagging, naming conventions, common mistakes |
| 13 | logger | Structured logger: levels, customization, adding your own levels |
| 14 | scanner | Page scanner: analyze a live page and generate a Page Object automatically |
| 15 | writing-your-first-test | End-to-end walkthrough: from DevTools to a running test in 5 steps |
| 16 | glossary | Plain-language reference for every concept used in the framework |
| 17 | biome | Biome linter & formatter: why we chose it, how to configure it, editor setup |


