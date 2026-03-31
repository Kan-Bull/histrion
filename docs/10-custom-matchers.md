# Custom Matchers

Custom matchers extend Playwright's `expect` with assertions specific to your application. Instead of writing verbose checks in every test, you define them once and reuse everywhere.

## Built-in matchers

Three custom matchers are included in `src/utils/custom-matchers.ts`:

### `toHaveStatus(expected)`

Asserts that an element has a `data-status` attribute matching the expected value.

```typescript
// Assert a row's status badge
await expect(row).toHaveStatus('active');
await expect(row).toHaveStatus('pending');
```

Useful for elements like `<span data-status="active">Active</span>`.

### `toHaveNumericText(expected, tolerance?)`

Asserts that an element's text content, parsed as a number, matches the expected value within a tolerance.

```typescript
// Price label shows "$99.99"
await expect(priceLabel).toHaveNumericText(99.99, 0.01);

// Counter shows "42 items" — extracts 42
await expect(counter).toHaveNumericText(42);
```

Strips non-numeric characters before parsing: `"$1,234.56"` becomes `1234.56`.

Default tolerance: `0.001`.

### `toBeSortedAlphabetically(descending?)`

Asserts that all matching elements are sorted alphabetically.

```typescript
// Check table column is sorted ascending
const names = page.locator('.name-cell');
await expect(names).toBeSortedAlphabetically();

// Check sorted descending
await expect(names).toBeSortedAlphabetically(true);
```

## Creating a new matcher

### Step 1: Add the matcher function

Open `src/utils/custom-matchers.ts` and add to the `baseExpect.extend({})` object:

```typescript
export const expect = baseExpect.extend({
  // ...existing matchers...

  async toHaveNotification(page: Page, type: 'success' | 'error', message: string) {
    const assertionName = 'toHaveNotification';
    const toast = page.locator(`[data-type="${type}"][role="alert"]`);

    let pass: boolean;
    let actual: string;

    try {
      await baseExpect(toast).toBeVisible();
      await baseExpect(toast).toContainText(message);
      pass = true;
      actual = message;
    } catch {
      pass = false;
      actual = (await toast.textContent()) ?? '(not visible)';
    }

    return {
      message: () =>
        `expected ${type} notification with "${message}", got "${actual}"`,
      pass,
      name: assertionName,
      expected: message,
      actual,
    };
  },
});
```

### Step 2: Use in tests

```typescript
import { expect } from '../../src/fixtures';

await expect(page).toHaveNotification('success', 'Settings saved');
await expect(page).toHaveNotification('error', 'Permission denied');
```

## Return value contract

Every matcher must return an object with:

| Field | Type | Purpose |
|-------|------|---------|
| `message` | `() => string` | Error message shown on failure |
| `pass` | `boolean` | Whether the assertion passed |
| `name` | `string` | Matcher name (used in reports) |
| `expected` | `any` | Expected value (used in diff output) |
| `actual` | `any` | Actual value (used in diff output) |

> [!tip] Error messages matter
> A matcher that fails with `"expected true, got false"` is useless. Write messages that tell you exactly what went wrong:
>
> ```
> expected element to have status "active", got "pending"
> expected success notification with "Saved!", got "(not visible)"
> expected elements to be sorted ascending
> ```

## How the re-export works

`src/utils/custom-matchers.ts` extends `@playwright/test`'s `expect` and exports the enhanced version. `src/fixtures/index.ts` re-exports it:

```typescript
// src/fixtures/index.ts
export { expect } from '../utils/custom-matchers';
```

Tests import from fixtures and get both Playwright's built-in matchers and your custom ones:

```typescript
import { test, expect } from '../../src/fixtures';

// Built-in Playwright matcher
await expect(locator).toBeVisible();

// Custom matcher
await expect(locator).toHaveStatus('active');
```

