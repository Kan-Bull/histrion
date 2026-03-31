# Prologue — Documentation

> [!tip] The Golden Rule
> **Tests never contain selectors.** They read like specifications.
>
> ```typescript
> // Good : reads like a spec
> test('admin can approve a pending application', async ({ dashboardPage }) => {
>   await dashboardPage.navigateTo('applications');
>   await dashboardPage.applications.filterByStatus('pending');
>   await dashboardPage.applications.approve(0);
>   await dashboardPage.toast.expectSuccess('Application approved');
> });
>
> // Bad : implementation details leaked into the test
> test('admin can approve', async ({ page }) => {
>   await page.click('[data-testid="nav-applications"]');
>   await page.selectOption('#status-filter', 'pending');
>   await page.click('.approve-btn');
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


