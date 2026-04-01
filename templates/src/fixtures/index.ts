import { test as base } from "@playwright/test";
import { ContactPage } from "../pages/contact.page";

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
 * test('user can contact support', async ({ contactPage }) => {
 *   await contactPage.fillContactForm({
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     email: 'john.doe@example.com',
 *     subject: 'customer-service',
 *     message: 'I need help with my account.'
 *   });
 *   await contactPage.submitForm();
 *   await contactPage.expectSuccessMessage();
 * });
 * ```
 *
 * Adding a new page:
 * 1. Create `src/pages/my-new.page.ts` extending BasePage
 * 2. Add the type to TestFixtures below
 * 3. Add the fixture definition in `base.extend()`
 */

type TestFixtures = {
  contactPage: ContactPage;
};

export const test = base.extend<TestFixtures>({
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
});

export { expect } from "../utils/custom-matchers";
