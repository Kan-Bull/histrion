# Writing your first test — from A to Z

This guide walks you through creating a complete test for a real page in your application, step by step.

By the end, you'll have:
- A typed data model
- A Page Object with locators, actions, and assertions
- A registered fixture
- Working tests

> **Tip:** If you scaffolded with starter templates, the boilerplate files are already in place — you just need to fill them in as you follow along.

---

## Step 0 — Map the page elements

Before writing code, open DevTools on the page you want to test and identify every element you'll interact with.

For example, if you're testing a login page:

| Element | Best locator | Notes |
|---------|-------------|-------|
| Username input | `data-testid="username"` | Text field |
| Password input | `data-testid="password"` | Password field |
| Submit button | `data-testid="login-submit"` | Button |
| Error message | `role="alert"` | Appears on invalid credentials |

> **Tip:** You can use `npx histrion scan <url>` to automate this step. The scanner finds all interactive elements and picks the best locator strategy for each one.

### Locator priority

Prefer stable, language-independent locators:

1. `data-testid` — most stable, recommended
2. `id` — stable if unique
3. `getByRole` + accessible name — good but can be locale-dependent
4. `getByLabel` — ties to form labels
5. `getByPlaceholder` — less stable
6. CSS selectors — last resort

---

## Step 1 — Define the data type

Create an interface that represents the data your page works with. If you have a starter template, rename and edit `src/data/types/example.ts`. Otherwise, create a new file in `src/data/types/`:

```typescript
export interface LoginCredentials {
  username: string;
  password: string;
}
```

Then export it from `src/data/types/index.ts`:

```typescript
export type { LoginCredentials } from './login';
```

This gives you type safety everywhere — the compiler will catch typos, missing fields, and wrong types.

---

## Step 2 — Create the Page Object

If you have a starter template, rename and edit `src/pages/example.page.ts`. Otherwise, create a new file (e.g. `src/pages/login.page.ts`):

```typescript
import { expect } from "@playwright/test";
import { BasePage } from "../core/base.page";
import type { LoginCredentials } from "../data/types";

export class LoginPage extends BasePage {
  readonly path = "/login";
  readonly pageTitle = /Login/;

  // ── Locators (private — never exposed to tests) ──
  private readonly usernameInput = this.page.getByTestId("username");
  private readonly passwordInput = this.page.getByTestId("password");
  private readonly submitButton = this.page.getByTestId("login-submit");
  private readonly errorMessage = this.page.getByRole("alert");

  // ── Actions ──

  async fillCredentials(data: LoginCredentials): Promise<void> {
    this.log.step(`Logging in as ${data.username}`);
    await this.fill(this.usernameInput, data.username, "username");
    await this.fill(this.passwordInput, data.password, "password");
  }

  async submit(): Promise<void> {
    this.log.step("Submitting login form");
    await this.click(this.submitButton, "Submit button");
  }

  // ── Assertions ──

  async expectDashboard(): Promise<void> {
    this.log.step("Verifying redirect to dashboard");
    await expect(this.page).toHaveURL(/dashboard/);
    this.log.success("Dashboard loaded");
  }

  async expectError(message: string): Promise<void> {
    this.log.step("Verifying error message");
    await expect(this.errorMessage).toContainText(message);
    this.log.success("Error message visible");
  }
}
```

Key principles:
- **Locators are `private readonly`** — tests never touch selectors directly
- **Actions use `this.log`** — every interaction is traced in the structured logger
- **Assertions live in the Page Object** — tests read like specifications, not implementation details
- **`this.fill()`, `this.click()`, `this.selectOption()`** — inherited from `BasePage`, they handle logging and waiting automatically

---

## Step 3 — Register the fixture

Open `src/fixtures/index.ts` and add your page:

```typescript
import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

type TestFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from "../utils/custom-matchers";
```

Now any test can request `loginPage` as a parameter and get a fully initialized instance.

---

## Step 4 — Write the tests

Create a test file in `tests/e2e/` (or rename `tests/e2e/example.spec.ts` if using the starter template):

```typescript
import { test } from "../../src/fixtures";

const validCredentials = {
  username: "user@example.com",
  password: "s3cret",
};

test.describe("Login @smoke", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test("should redirect to dashboard with valid credentials", async ({ loginPage }) => {
    await loginPage.fillCredentials(validCredentials);
    await loginPage.submit();
    await loginPage.expectDashboard();
  });

  test("should show error for invalid credentials", async ({ loginPage }) => {
    await loginPage.fillCredentials({
      username: "bad@example.com",
      password: "wrong",
    });
    await loginPage.submit();
    await loginPage.expectError("Invalid credentials");
  });
});
```

Notice how the tests read like plain English:
1. Navigate to the login page
2. Fill in credentials
3. Submit
4. Expect success (or error)

No selectors, no `page.click()`, no implementation details.

---

## Step 5 (optional) — Add a data builder with Faker.js

If you installed Faker.js during scaffolding, you can create a builder that generates random but realistic test data.

Create `src/data/builders/login.builder.ts`:

```typescript
import { faker } from "@faker-js/faker";
import type { LoginCredentials } from "../types";
import { Builder } from "./base.builder";

export class LoginBuilder extends Builder<LoginCredentials> {
  constructor() {
    super({
      username: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
    });
  }

  static create(): LoginBuilder {
    return new LoginBuilder();
  }

  withUsername(username: string): this {
    this.data.username = username;
    return this;
  }

  withPassword(password: string): this {
    this.data.password = password;
    return this;
  }
}
```

Now use it in tests:

```typescript
import { LoginBuilder } from "../../src/data/builders/login.builder";

test("should handle random valid credentials", async ({ loginPage }) => {
  await loginPage.fillCredentials(LoginBuilder.create().build());
  await loginPage.submit();
  // assert expected outcome
});
```

Override only what matters for a specific test:

```typescript
LoginBuilder.create().withUsername("admin@company.com").build();
```

---

## Summary

| Step | File | What you did |
|------|------|-------------|
| 0 | DevTools / scanner | Mapped interactive elements and their best locators |
| 1 | `src/data/types/` | Defined the data interface |
| 2 | `src/pages/*.page.ts` | Created the Page Object with locators, actions, assertions |
| 3 | `src/fixtures/index.ts` | Registered the fixture for dependency injection |
| 4 | `tests/e2e/*.spec.ts` | Wrote the actual tests |
| 5 | `src/data/builders/*.builder.ts` | *(optional)* Added a Faker-powered data builder |

This is the pattern for every page you test. The structure stays the same — only the locators, actions, and assertions change.
