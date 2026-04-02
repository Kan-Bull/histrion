# Starter Template Files — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace contact-form examples with generic boilerplate skeleton files that users fill in for their own app.

**Architecture:** Swap 3 contact-specific template files for 3 generic skeleton files (type, page object, test). Update fixtures and scaffolding logic. No new dependencies.

**Tech Stack:** TypeScript, Node.js fs APIs

---

### Task 1: Create the skeleton type file

**Files:**
- Create: `templates/src/data/types/example.ts`

**Step 1: Create `templates/src/data/types/example.ts`**

```typescript
/**
 * Data type for your page.
 *
 * Define the shape of data your Page Object works with.
 * Rename this file and interface to match your domain
 * (e.g. LoginCredentials, SearchFilters, RegistrationData).
 */
export interface ExampleData {
  // Add your fields here, e.g.:
  // username: string;
  // password: string;
  // rememberMe: boolean;
}
```

**Step 2: Commit**

```bash
git add templates/src/data/types/example.ts
git commit -m "feat: add skeleton ExampleData type template"
```

---

### Task 2: Create the skeleton page object

**Files:**
- Create: `templates/src/pages/example.page.ts`

**Step 1: Create `templates/src/pages/example.page.ts`**

```typescript
import { expect } from "@playwright/test";
import { BasePage } from "../core/base.page";
import type { ExampleData } from "../data/types/example";

/**
 * Starter Page Object — rename and adapt to your first page.
 *
 * 1. Set `path` to your page's URL path
 * 2. Set `pageTitle` to match the document title
 * 3. Add private locators for every interactive element
 * 4. Write action methods that combine locator interactions
 * 5. Write assertion methods that verify expected outcomes
 *
 * See docs/03-page-objects.md for the full guide.
 */
export class ExamplePage extends BasePage {
  readonly path = "/replace-with-your-path";
  readonly pageTitle = /Replace With Your Page Title/;

  // ── Locators (private — never exposed to tests) ──

  // private readonly usernameInput = this.page.getByTestId("username");
  // private readonly passwordInput = this.page.getByTestId("password");
  // private readonly submitButton = this.page.getByRole("button", { name: "Submit" });
  // private readonly errorMessage = this.page.getByRole("alert");

  // ── Actions ──

  // async fillForm(data: ExampleData): Promise<void> {
  //   this.log.step("Filling form");
  //   await this.fill(this.usernameInput, data.username, "username");
  //   await this.fill(this.passwordInput, data.password, "password");
  // }

  // async submit(): Promise<void> {
  //   this.log.step("Submitting form");
  //   await this.click(this.submitButton, "Submit button");
  // }

  // ── Assertions ──

  // async expectSuccess(): Promise<void> {
  //   this.log.step("Verifying success");
  //   await expect(this.page).toHaveURL(/expected-url/);
  //   this.log.success("Navigation successful");
  // }

  // async expectError(message: string): Promise<void> {
  //   this.log.step("Verifying error message");
  //   await expect(this.errorMessage).toContainText(message);
  //   this.log.success("Error message visible");
  // }
}
```

**Step 2: Commit**

```bash
git add templates/src/pages/example.page.ts
git commit -m "feat: add skeleton ExamplePage page object template"
```

---

### Task 3: Create the skeleton test file

**Files:**
- Create: `templates/tests/e2e/example.spec.ts`

**Step 1: Create `templates/tests/e2e/example.spec.ts`**

```typescript
import { test } from "../../src/fixtures";

/**
 * Starter test file — rename and adapt to your first page.
 *
 * Tests should read like specifications:
 * - No selectors or implementation details
 * - Use page object actions and assertions
 * - One behavior per test
 *
 * See docs/15-writing-your-first-test.md for the full guide.
 */
test.describe("Example page @smoke", () => {
  test.beforeEach(async ({ examplePage }) => {
    await examplePage.navigate();
  });

  // test("should do something with valid data", async ({ examplePage }) => {
  //   await examplePage.fillForm({ /* your data */ });
  //   await examplePage.submit();
  //   await examplePage.expectSuccess();
  // });

  // test("should show error for invalid data", async ({ examplePage }) => {
  //   await examplePage.fillForm({ /* invalid data */ });
  //   await examplePage.submit();
  //   await examplePage.expectError("Expected error message");
  // });
});
```

**Step 2: Commit**

```bash
git add templates/tests/e2e/example.spec.ts
git commit -m "feat: add skeleton example test template"
```

---

### Task 4: Update fixtures to wire ExamplePage

**Files:**
- Modify: `templates/src/fixtures/index.ts`

**Step 1: Replace the entire file content**

```typescript
import { test as base } from "@playwright/test";
import { ExamplePage } from "../pages/example.page";

/**
 * Custom test fixtures extending Playwright's base test.
 *
 * This is the bridge between your Page Objects and your tests.
 * Each fixture instantiates a Page Object and injects it into
 * the test function — tests never call `new Page()` directly.
 *
 * Adding a new page:
 * 1. Create `src/pages/my-new.page.ts` extending BasePage
 * 2. Add the type to TestFixtures below
 * 3. Add the fixture definition in `base.extend()`
 */

type TestFixtures = {
  examplePage: ExamplePage;
};

export const test = base.extend<TestFixtures>({
  examplePage: async ({ page }, use) => {
    await use(new ExamplePage(page));
  },
});

export { expect } from "../utils/custom-matchers";
```

**Step 2: Commit**

```bash
git add templates/src/fixtures/index.ts
git commit -m "feat: wire ExamplePage fixture in starter template"
```

---

### Task 5: Clean up types — remove ContactFormData, keep ExampleData export

**Files:**
- Modify: `templates/src/data/types/index.ts`

**Step 1: Replace the file content**

Remove `ContactFormData`, `ContactSubject`. Keep `User`, `LoginCredentials` (these are generic/useful). Add re-export of `ExampleData`.

```typescript
/**
 * Domain types used across test data builders and page objects.
 *
 * Keep these aligned with the application's actual models.
 * These are NOT API response types — they represent the data
 * shape your tests work with.
 */

export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user" | "readonly";
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export type { ExampleData } from "./example";

/**
 * Add your domain-specific types below.
 *
 * Example:
 * ```ts
 * export interface LoanApplication {
 *   applicantName: string;
 *   amount: number;
 *   currency: string;
 *   term: number;
 *   riskRating: 'A' | 'B' | 'C' | 'D';
 * }
 * ```
 */
```

**Step 2: Commit**

```bash
git add templates/src/data/types/index.ts
git commit -m "refactor: remove ContactFormData, re-export ExampleData"
```

---

### Task 6: Delete contact-specific template files

**Files:**
- Delete: `templates/src/pages/contact.page.ts`
- Delete: `templates/src/data/builders/contact.builder.ts`
- Delete: `templates/tests/e2e/contact.spec.ts`

**Step 1: Delete the files**

```bash
rm templates/src/pages/contact.page.ts
rm templates/src/data/builders/contact.builder.ts
rm templates/tests/e2e/contact.spec.ts
```

**Step 2: Commit**

```bash
git add -A
git commit -m "refactor: remove contact-specific example files"
```

---

### Task 7: Update scaffolding logic in `src/index.ts`

**Files:**
- Modify: `src/index.ts`

This is the biggest task — 5 spots to update.

**Step 1: Update the prompt text (line 136-139)**

Change:
```typescript
message: "Include example files? (Contact page, test & builder for practicesoftwaretesting.com)",
```
To:
```typescript
message: "Include starter template files? (Page Object, fixture & test boilerplate to get started)",
```

**Step 2: Update the `!includeExamples` cleanup block (lines 221-264)**

Replace the entire block with:

```typescript
    // Remove starter template files if not requested
    if (!config.includeExamples) {
      removeFile(path.join(targetDir, "src", "pages", "example.page.ts"));
      removeFile(path.join(targetDir, "src", "data", "types", "example.ts"));
      removeFile(path.join(targetDir, "tests", "e2e", "example.spec.ts"));

      // Reset fixtures to an empty shell
      const fixturesPath = path.join(targetDir, "src", "fixtures", "index.ts");
      fs.writeFileSync(
        fixturesPath,
        [
          'import { test as base } from "@playwright/test";',
          "",
          "/**",
          " * Custom test fixtures extending Playwright's base test.",
          " *",
          " * Add your Page Objects here:",
          " * 1. Import your page class",
          " * 2. Add it to TestFixtures",
          " * 3. Add the fixture definition in base.extend()",
          " */",
          "",
          "type TestFixtures = {",
          "  // myPage: MyPage;",
          "};",
          "",
          "export const test = base.extend<TestFixtures>({",
          "  // myPage: async ({ page }, use) => {",
          "  //   await use(new MyPage(page));",
          "  // },",
          "});",
          "",
          'export { expect } from "../utils/custom-matchers";',
          "",
        ].join("\n"),
      );

      // Strip ExampleData re-export from types
      const typesPath = path.join(targetDir, "src", "data", "types", "index.ts");
      let typesContent = fs.readFileSync(typesPath, "utf-8");
      typesContent = typesContent.replace(/export type \{ ExampleData \}.*\n\n?/m, "");
      fs.writeFileSync(typesPath, typesContent);
    }
```

**Step 3: Remove the Faker/contact builder coupling (lines 267-269)**

Delete this block entirely:
```typescript
    // Remove Faker-dependent builder if Faker not included but examples are
    if (!config.includeFaker && config.includeExamples) {
      removeFile(path.join(targetDir, "src", "data", "builders", "contact.builder.ts"));
    }
```

**Step 4: Update the success message (lines 372-381)**

Replace:
```typescript
  if (config.includeExamples) {
    console.log(kleur.bold("  Example tests included:\n"));
    console.log(
      kleur.dim("    The project includes a Contact page example based on"),
    );
    console.log(
      kleur.dim("    https://practicesoftwaretesting.com — run them to see"),
    );
    console.log(kleur.dim("    the framework in action.\n"));
  }
```
With:
```typescript
  if (config.includeExamples) {
    console.log(kleur.bold("  Starter templates included:\n"));
    console.log(
      kleur.dim("    The project includes Page Object, fixture & test"),
    );
    console.log(
      kleur.dim("    boilerplate in src/pages/example.page.ts — open it"),
    );
    console.log(kleur.dim("    and follow docs/15-writing-your-first-test.md.\n"));
  }
```

**Step 5: Update `printStructure` (lines 452-464)**

Replace the two `config.includeExamples` ternaries:

```typescript
    config.includeExamples
      ? "  ├── pages/           Page Objects (starter template included)"
      : "  ├── pages/           Page Objects (one per page)",
```

```typescript
    config.includeExamples
      ? "  ├── e2e/             End-to-end specs (starter template included)"
      : "  ├── e2e/             End-to-end specs",
```

**Step 6: Commit**

```bash
git add src/index.ts
git commit -m "feat: update scaffolding logic for starter templates"
```

---

### Task 8: Build and verify

**Step 1: Run TypeScript build**

```bash
npm run build
```
Expected: Clean compilation, no errors.

**Step 2: Verify the dist output exists**

```bash
ls dist/index.js
```
Expected: File exists.

**Step 3: Commit (if build output is tracked)**

Only if `dist/` is committed to the repo.

---
