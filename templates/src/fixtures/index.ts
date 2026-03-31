import { test as base } from "@playwright/test";
import { DashboardPage } from "../pages/dashboard.page";
import { LoginPage } from "../pages/login.page";

/**
 * Custom test fixtures extending Playwright's base test.
 *
 * This is the bridge between your Page Objects and your tests.
 * Each fixture instantiates a Page Object and injects it into
 * the test function — tests never call `new Page()` directly.
 *
 * Usage in tests:
 * ```ts
 * import { test, expect } from '../src/fixtures';
 *
 * test('user can login', async ({ loginPage, dashboardPage }) => {
 *   await loginPage.loginAs(users.admin);
 *   await dashboardPage.expectToBeVisible();
 * });
 * ```
 *
 * Adding a new page:
 * 1. Create `src/pages/my-new.page.ts` extending BasePage
 * 2. Add the type to TestFixtures below
 * 3. Add the fixture definition in `base.extend()`
 */

type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from "../utils/custom-matchers";
