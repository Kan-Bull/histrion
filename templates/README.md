# {{projectName}}

Production-grade Playwright test suite with Page Object Model architecture.

## Architecture

```
src/
├── core/               # Abstract base classes (BasePage, BaseComponent, BaseAPI)
├── components/          # Reusable UI components (Table, Modal, Form, Toast)
├── pages/               # Page Objects — one per application page
├── fixtures/            # Playwright fixtures — injects Pages into tests
├── api/                 # API clients for test setup/teardown
├── data/
│   ├── builders/        # Fluent test data builders
│   └── types/           # Domain types
├── config/              # Environment & user configuration
├── reporters/           # Custom test reporters
└── utils/               # Logger, visual regression, custom matchers

tests/
├── e2e/                 # End-to-end test specs
└── visual/              # Visual regression test specs
```

### The Golden Rule

> **Tests never contain selectors or raw Playwright calls.**
> They read like specifications — calling only Page Object methods.

```typescript
test('user can submit a contact form', async ({ contactPage }) => {
  await contactPage.navigate();
  await contactPage.fillContactForm(ContactBuilder.create().build());
  await contactPage.submitForm();
  await contactPage.expectSuccessMessage();
});
```

## Quick Start

```bash
# Install dependencies
npm install

# Install browsers
npx playwright install --with-deps

# Copy env config
cp .env.example .env

# Run all tests
npm test

# Run smoke tests only
npm run test:smoke

# Run with UI mode
npm run test:ui
```

## Available Scripts

| Script                  | Description                              |
|-------------------------|------------------------------------------|
| `npm test`              | Run all tests                            |
| `npm run test:smoke`    | Run tests tagged `@smoke`                |
| `npm run test:regression` | Run tests tagged `@regression`         |
| `npm run test:critical` | Run tests tagged `@critical`             |
| `npm run test:visual`   | Run visual regression tests              |
| `npm run test:mobile`   | Run tests on mobile viewport             |
| `npm run test:headed`   | Run tests in headed mode                 |
| `npm run test:debug`    | Run tests with Playwright Inspector      |
| `npm run test:ui`       | Open Playwright UI mode                  |
| `npm run test:dev`      | Run against dev environment              |
| `npm run test:staging`  | Run against staging environment          |
| `npm run report`        | Open the HTML test report                |
| `npm run lint`          | Check code with Biome                    |
| `npm run lint:fix`      | Auto-fix lint issues                     |
| `npm run codegen`       | Open Playwright code generator           |
| `npm run update-snapshots` | Update visual regression baselines    |

## Environment Configuration

Set `TEST_ENV` to target different environments:

```bash
TEST_ENV=staging npm test
```

Environments are defined in `src/config/env.config.ts`. Each environment configures: base URL, timeouts, retries, workers, and headless mode.

## Adding a New Page Object

1. Create `src/pages/my-new.page.ts`:

```typescript
import { BasePage } from '../core/base.page';

export class MyNewPage extends BasePage {
  readonly path = '/my-page';
  readonly pageTitle = /My Page/;

  // Locators (private)
  private readonly header = this.page.getByTestId('page-header');

  // Actions (public)
  async doSomething(): Promise<void> {
    await this.click(this.header, 'Page header');
  }

  // Assertions (public)
  async expectHeader(text: string): Promise<void> {
    const { expect } = await import('@playwright/test');
    await expect(this.header).toHaveText(text);
  }
}
```

2. Register in `src/fixtures/index.ts`:

```typescript
import { MyNewPage } from '../pages/my-new.page';

type TestFixtures = {
  // ... existing
  myNewPage: MyNewPage;
};

export const test = base.extend<TestFixtures>({
  // ... existing
  myNewPage: async ({ page }, use) => {
    await use(new MyNewPage(page));
  },
});
```

3. Use in tests:

```typescript
test('should work', async ({ myNewPage }) => {
  await myNewPage.navigate();
  await myNewPage.expectHeader('Welcome');
});
```

## Tags

Use Playwright's built-in tagging for test organization:

- `@smoke` — Critical path tests, run on every PR
- `@regression` — Full regression suite
- `@critical` — Business-critical flows
- `@visual` — Visual regression tests
- `@mobile` — Mobile-specific tests
- `@user` — Tests run as standard user (not admin)

```bash
npx playwright test --grep @smoke
npx playwright test --grep-invert @visual
```

## CI/CD

GitHub Actions workflow is included at `.github/workflows/playwright.yml`.
It supports manual dispatch with environment and project selection.

Required secrets: `ADMIN_USER`, `ADMIN_PASS`, `STANDARD_USER`, `STANDARD_PASS`.
