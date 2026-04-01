# Fixtures

Fixtures are Playwright's dependency injection system. Instead of manually creating Page Objects in every test, you declare what you need and Playwright provides it.

## How it works

The file `src/fixtures/index.ts` defines custom fixtures that extend Playwright's built-in `test`:

```typescript
import { test as base } from '@playwright/test';
import { ContactPage } from '../pages/contact.page';

type TestFixtures = {
  contactPage: ContactPage;
};

export const test = base.extend<TestFixtures>({
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
});

export { expect } from '../utils/custom-matchers';
```

When a test declares `async ({ contactPage }) =>`, Playwright:
1. Creates a fresh `page` (browser tab)
2. Passes it to the `contactPage` fixture function
3. Constructs `new ContactPage(page)`
4. Injects the instance into your test via `use()`
5. After the test, tears everything down

## Adding a new fixture

Three lines. That's it.

```typescript
// 1. Import the Page Object
import { SettingsPage } from '../pages/settings.page';

// 2. Add to the type
type TestFixtures = {
  contactPage: ContactPage;
  settingsPage: SettingsPage;  // ← add
};

// 3. Add the fixture definition
settingsPage: async ({ page }, use) => {
  await use(new SettingsPage(page));
},
```

Now any test can request `settingsPage`:

```typescript
test('can change settings', async ({ settingsPage }) => {
  await settingsPage.navigate();
  // ...
});
```

## Fixtures with pre-setup

Sometimes you want a fixture that does setup work before the test runs — like navigating to a page or logging in:

```typescript
contactPage: async ({ page }, use) => {
  const contact = new ContactPage(page);
  await contact.navigate();          // pre-navigate
  await contact.waitForPageReady();  // wait for page to load
  await use(contact);                // test starts here
},
```

The test receives a `contactPage` that's already on the contact page:

```typescript
test('contact form is ready', async ({ contactPage }) => {
  // Already navigated — go straight to assertions
  await contactPage.expectSuccessMessage();
});
```

> [!tip] Use pre-setup sparingly
> Only pre-navigate when every test using that fixture starts on the same page. Otherwise, keep fixtures simple and let tests call `navigate()` themselves.

## Lazy fixtures

Playwright only runs fixtures that the test actually requests. If a test only needs `contactPage`, other fixtures are never created. No wasted work.

```typescript
// Only contactPage is instantiated — other fixtures are skipped
test('contact form shows validation errors', async ({ contactPage }) => {
  await contactPage.navigate();
  await contactPage.submitForm();
  await contactPage.expectValidationErrors();
});
```

## Fixtures with cleanup

The code after `await use()` runs as cleanup, even if the test fails:

```typescript
apiClient: async ({}, use) => {
  const api = new ContactAPI();
  const contact = await api.createContact(ContactBuilder.create().build());
  await use(api);
  // Cleanup: runs after test completes (pass or fail)
  await api.deleteContact(contact.id);
  await api.dispose();
},
```

This is how you guarantee teardown. See [[07-api-helpers]] for more on API fixtures.

## Fixture dependencies

Fixtures can depend on other fixtures:

```typescript
preparedContactPage: async ({ contactPage }, use) => {
  await contactPage.navigate();
  await use(contactPage);
},
```

Playwright resolves the dependency graph automatically.

> [!tip] Always import from `src/fixtures`
> Never import `test` or `expect` from `@playwright/test` directly in your test files. Always use:
>
> ```typescript
> import { test, expect } from '../../src/fixtures';
> ```
>
> The fixtures file re-exports `test` with your custom fixtures applied, and `expect` with custom matchers. Importing from `@playwright/test` bypasses both.

