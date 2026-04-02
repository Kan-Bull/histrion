# AI Agent Instructions — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold AI coding assistant instruction files during `histrion create` so AI tools follow the project's POM architecture strictly.

**Architecture:** A single markdown template stored in `resources/ai-instructions.md` (outside `templates/` to avoid being copied by `copyDir`). A multiselect prompt lets the user pick which AI tools to generate files for. The scaffolding logic reads the template, applies variable replacements, and writes it to each selected path.

**Tech Stack:** TypeScript, `prompts` library (multiselect type), Node.js fs APIs

---

### Task 1: Create the AI instructions template content

**Files:**
- Create: `resources/ai-instructions.md`

**Step 1: Create the `resources/` directory and the template file**

```markdown
# {{projectName}} — AI Coding Instructions

This is a Playwright + TypeScript test automation project using Page Object Model (POM) architecture.
Follow these rules strictly when generating or modifying code.

## Architecture

The project uses a 7-layer architecture. Dependencies flow **down only**:

```
Tests → Fixtures → Pages → Components → Core → Config → Utils
```

| Layer | Directory | Purpose |
|-------|-----------|---------|
| Tests | `tests/e2e/` | Test specs — no selectors, no raw Playwright calls |
| Fixtures | `src/fixtures/` | Dependency injection — bridges Page Objects to tests |
| Pages | `src/pages/` | Page Objects — one per application page |
| Components | `src/components/` | Reusable UI parts (Table, Modal, Form, Toast) |
| Core | `src/core/` | Abstract base classes (BasePage, BaseComponent, BaseAPI) |
| Config | `src/config/` | Environment & user configuration |
| Utils | `src/utils/` | Logger, custom matchers, visual helpers |

## The Golden Rule

> **Tests NEVER contain selectors or raw Playwright calls.**
> They read like specifications, calling only Page Object methods.

```typescript
// CORRECT
test('user can log in', async ({ loginPage }) => {
  await loginPage.navigate();
  await loginPage.fillCredentials({ username: 'user@test.com', password: 's3cret' });
  await loginPage.submit();
  await loginPage.expectDashboard();
});

// WRONG — never do this in a test file
test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="username"]', 'user@test.com');
  await page.click('button[type="submit"]');
});
```

## Writing Tests

### Imports

Always import `test` and `expect` from the project fixtures, **never** from `@playwright/test`:

```typescript
// CORRECT
import { test } from '../../src/fixtures';

// WRONG
import { test } from '@playwright/test';
```

### Structure

- Use fixture-injected Page Objects — never call `new Page()` in tests
- One behavior per test — if you need "and", split into two tests
- Tag every `test.describe` block: `@smoke`, `@regression`, `@critical`, `@visual`
- Test descriptions: `"should <expected behavior>"` or `"<subject> can <action>"`

```typescript
test.describe('Login @smoke', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.fillCredentials({ username: 'bad', password: 'bad' });
    await loginPage.submit();
    await loginPage.expectError('Invalid credentials');
  });
});
```

### Forbidden in tests

- **No `page.waitForTimeout()`** — wait for conditions: `waitForLoadState`, `waitForResponse`, or expect assertions
- **No `try/catch` to swallow failures** — let tests fail, investigate why
- **No shared mutable state between tests** — each test is independent, use fixtures for setup
- **No hardcoded test data** — use data builders

## Writing Page Objects

Every Page Object extends `BasePage` and follows this structure:

```typescript
import { expect } from '@playwright/test';
import { BasePage } from '../core/base.page';
import type { MyData } from '../data/types';

export class MyPage extends BasePage {
  readonly path = '/my-page';
  readonly pageTitle = /My Page/;

  // ── Locators (private — never exposed to tests) ──
  private readonly emailInput = this.page.getByTestId('email');
  private readonly submitButton = this.page.getByRole('button', { name: 'Submit' });
  private readonly successAlert = this.page.getByRole('alert');

  // ── Actions ──
  async fillForm(data: MyData): Promise<void> {
    this.log.step('Filling form');
    await this.fill(this.emailInput, data.email, 'email');
  }

  async submit(): Promise<void> {
    this.log.step('Submitting form');
    await this.click(this.submitButton, 'Submit button');
  }

  // ── Assertions ──
  async expectSuccess(): Promise<void> {
    this.log.step('Verifying success');
    await expect(this.successAlert).toBeVisible();
    this.log.success('Success alert visible');
  }
}
```

### Rules

- **All locators are `private readonly`** — never expose selectors to tests
- **Use BasePage inherited methods:** `this.fill()`, `this.click()`, `this.selectOption()`, `this.getText()` — not raw `page.fill()` or `page.click()`
- **Use the structured logger:** `this.log.step()` for high-level actions, `this.log.action()` for details, `this.log.success()` for confirmations
- **Assertions live in the Page Object** as `expect*()` methods
- **If a Page Object exceeds ~200 lines**, extract reusable parts into Components

## Components

Reusable UI patterns (modals, tables, forms, toasts) extend `BaseComponent`:

```typescript
import { BaseComponent } from '../core/base.component';

export class ModalComponent extends BaseComponent {
  private readonly title = this.root.getByTestId('modal-title');
  private readonly confirmButton = this.root.getByRole('button', { name: 'Confirm' });

  async confirm(): Promise<void> {
    await this.click(this.confirmButton, 'Confirm button');
  }
}
```

Components are composed into Page Objects:

```typescript
readonly confirmModal = new ModalComponent(this.page, this.page.getByTestId('confirm-modal'));
```

## Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
| Page Object | `kebab-case.page.ts` | `user-profile.page.ts` |
| Component | `kebab-case.component.ts` | `date-picker.component.ts` |
| Test spec | `kebab-case.spec.ts` | `user-profile.spec.ts` |
| API client | `kebab-case.api.ts` | `user.api.ts` |
| Builder | `kebab-case.builder.ts` | `user.builder.ts` |

### Classes and methods

| Type | Pattern | Example |
|------|---------|---------|
| Page class | `PascalCase + Page` | `UserProfilePage` |
| Component class | `PascalCase + Component` | `DatePickerComponent` |
| API class | `PascalCase + API` | `UserAPI` |
| Builder class | `PascalCase + Builder` | `UserBuilder` |
| Action methods | Verb phrase | `submitForm()`, `deleteRow()` |
| Assertion methods | `expect` + noun | `expectSuccess()`, `expectErrorMessage()` |

## Adding a New Page — The Workflow

Always follow these 4 steps in order:

1. **Define the data type** in `src/data/types/`
2. **Create the Page Object** in `src/pages/` extending `BasePage`
3. **Register the fixture** in `src/fixtures/index.ts`
4. **Write the test** in `tests/e2e/`

## Fixtures

All Page Objects are registered in `src/fixtures/index.ts`:

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

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
```

**Every new Page Object must be registered here.** Tests receive pages via parameter destructuring.

## Data Builders

Use the fluent builder pattern extending `Builder<T>`:

```typescript
import { Builder } from './base.builder';
import type { UserData } from '../types';

export class UserBuilder extends Builder<UserData> {
  constructor() {
    super({ name: 'John', email: 'john@test.com', role: 'user' });
  }

  static create(): UserBuilder {
    return new UserBuilder();
  }

  withRole(role: string): this {
    this.data.role = role;
    return this;
  }
}
```

Usage: `UserBuilder.create().withRole('admin').build()`

## Checklist Before Commit

- [ ] Tests pass: `npm test`
- [ ] No selectors in test files
- [ ] Every `test.describe` has a tag
- [ ] New Page Objects registered in `src/fixtures/index.ts`
- [ ] No `waitForTimeout()` calls
- [ ] No hardcoded test data — use builders
- [ ] Imports from `src/fixtures`, not `@playwright/test`
- [ ] Lint passes: `npm run lint`
```

**Step 2: Commit**

```bash
git add resources/ai-instructions.md
git commit -m "feat: add AI coding assistant instructions template"
```

---

### Task 2: Add multiselect prompt and config type

**Files:**
- Modify: `src/index.ts:13-21` (ProjectConfig interface)
- Modify: `src/index.ts:119-167` (prompts array)

**Step 1: Add `aiInstructions` to the ProjectConfig interface**

Add `aiInstructions: string[];` to the interface at line 21, before the closing `}`.

**Step 2: Add the multiselect prompt after the `includeCi` prompt (after line 164)**

Insert before the closing `]`:

```typescript
      {
        type: "multiselect",
        name: "aiInstructions",
        message: "AI coding assistant instructions?",
        choices: [
          { title: "GitHub Copilot", value: "copilot" },
          { title: "Claude Code", value: "claude" },
          { title: "Cursor", value: "cursor" },
          { title: "Windsurf", value: "windsurf" },
        ],
        hint: "— space to select, enter to confirm",
      },
```

**Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add AI instructions multiselect prompt"
```

---

### Task 3: Add scaffolding logic to write AI instructions files

**Files:**
- Modify: `src/index.ts` — add constant for the AI instructions directory path, and add logic after the CI removal block (around line 273)

**Step 1: Add `AI_INSTRUCTIONS_DIR` constant at the top (after line 11)**

```typescript
const AI_INSTRUCTIONS_DIR = path.join(__dirname, "..", "resources");
```

**Step 2: Add the AI instructions file mapping and writing logic**

Insert after the CI removal block (after line 273 `}`), before `copyDir(DOCS_DIR, ...)`:

```typescript

    // Write AI coding assistant instructions
    if (config.aiInstructions.length > 0) {
      const aiTemplatePath = path.join(AI_INSTRUCTIONS_DIR, "ai-instructions.md");
      let aiContent = fs.readFileSync(aiTemplatePath, "utf-8");
      aiContent = aiContent.replace(/\{\{projectName\}\}/g, config.projectName);

      const aiFileMap: Record<string, string> = {
        copilot: path.join(".github", "copilot-instructions.md"),
        claude: "CLAUDE.md",
        cursor: ".cursorrules",
        windsurf: ".windsurfrules",
      };

      for (const tool of config.aiInstructions) {
        const relativePath = aiFileMap[tool];
        if (relativePath) {
          const fullPath = path.join(targetDir, relativePath);
          fs.mkdirSync(path.dirname(fullPath), { recursive: true });
          fs.writeFileSync(fullPath, aiContent);
        }
      }
    }
```

Note: `fs.mkdirSync(path.dirname(fullPath), { recursive: true })` handles the case where the user selected Copilot but not GitHub Actions CI/CD (so `.github/` may not exist).

**Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: scaffold AI instructions to selected tool paths"
```

---

### Task 4: Add success message and update printStructure

**Files:**
- Modify: `src/index.ts` — success message section (~line 384) and `printStructure` function

**Step 1: Add success message after the Faker block (after line 384)**

Insert after the `includeFaker` block:

```typescript

  if (config.aiInstructions.length > 0) {
    const toolNames: Record<string, string> = {
      copilot: "GitHub Copilot",
      claude: "Claude Code",
      cursor: "Cursor",
      windsurf: "Windsurf",
    };
    const names = config.aiInstructions.map((t) => toolNames[t] || t).join(", ");
    console.log(kleur.bold("  AI instructions included:\n"));
    console.log(
      kleur.dim(`    Generated for: ${names}`),
    );
    console.log(
      kleur.dim("    Your AI assistant will follow the project's POM architecture.\n"),
    );
  }
```

**Step 2: Update `printStructure` to accept `config` and show AI files**

Add a line after the `visual` line in the `lines` array (before `].filter(Boolean)`):

```typescript
    config.aiInstructions.length > 0
      ? `  AI instructions:     ${config.aiInstructions.map((t) => {
          const fileMap: Record<string, string> = { copilot: ".github/copilot-instructions.md", claude: "CLAUDE.md", cursor: ".cursorrules", windsurf: ".windsurfrules" };
          return fileMap[t] || t;
        }).join(", ")}`
      : null,
```

**Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add AI instructions success message and structure output"
```

---

### Task 5: Build and verify

**Step 1: Run TypeScript build**

```bash
npm run build
```
Expected: Clean compilation, no errors.

**Step 2: Commit dist if tracked**

```bash
git add dist/index.js
git commit -m "chore: rebuild dist with AI instructions feature"
```

---
