# Components

A Component represents a self-contained UI element that appears on multiple pages — a data table, a modal dialog, a toast notification, a dropdown menu.

## When to create a Component

Create a Component when a UI element:
- Appears on **2 or more pages**
- Has its own **internal interactions** (click, fill, expand)
- Can be **scoped to a root element** in the DOM

If the element only appears on one page, keep the logic in the Page Object instead.

## Anatomy

Every Component extends `BaseComponent` and receives two constructor arguments: the `page` and a `root` Locator that scopes all interactions.

```typescript
import { BaseComponent } from '../core/base.component';

export class DropdownComponent extends BaseComponent {
  // All locators are relative to this.root
  private readonly trigger = this.locator('[data-testid="dropdown-trigger"]');
  private readonly options = this.locator('[data-testid="dropdown-option"]');
  private readonly selected = this.locator('[data-testid="dropdown-selected"]');
}
```

The `this.locator(selector)` method searches **within the root element**, not the entire page. This means multiple instances of the same Component on one page work independently.

## Full example: DropdownComponent

```typescript
import { expect, type Locator } from '@playwright/test';
import { BaseComponent } from '../core/base.component';

export class DropdownComponent extends BaseComponent {
  private readonly trigger = this.locator('[data-testid="dropdown-trigger"]');
  private readonly options = this.locator('[data-testid="dropdown-option"]');
  private readonly selected = this.locator('[data-testid="dropdown-selected"]');

  // Actions

  async open(): Promise<void> {
    this.log.action('Open dropdown');
    await this.trigger.click();
    await this.options.first().waitFor({ state: 'visible' });
  }

  async selectByText(text: string): Promise<void> {
    this.log.action(`Select option: ${text}`);
    await this.open();
    await this.options.filter({ hasText: text }).click();
  }

  async getSelectedText(): Promise<string> {
    return (await this.selected.textContent()) ?? '';
  }

  // Assertions

  async expectSelected(text: string): Promise<void> {
    await expect(this.selected).toHaveText(text);
  }

  async expectOptionCount(count: number): Promise<void> {
    await this.open();
    await expect(this.options).toHaveCount(count);
  }
}
```

## Composing in a Page Object

```typescript
import type { Page } from '@playwright/test';
import { DropdownComponent } from '../components/dropdown.component';
import { BasePage } from '../core/base.page';

export class FiltersPage extends BasePage {
  readonly path = '/filters';
  readonly pageTitle = /Filters/;

  readonly statusFilter: DropdownComponent;
  readonly categoryFilter: DropdownComponent;

  constructor(page: Page) {
    super(page);
    // Each dropdown gets its own root — they work independently
    this.statusFilter = new DropdownComponent(page, page.getByTestId('filter-status'));
    this.categoryFilter = new DropdownComponent(page, page.getByTestId('filter-category'));
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.selectByText(status);
  }
}
```

Tests use it through the Page Object:

```typescript
test('can filter by status', async ({ filtersPage }) => {
  await filtersPage.navigate();
  await filtersPage.filterByStatus('Active');
  await filtersPage.statusFilter.expectSelected('Active');
});
```

## Built-in Components

The framework ships with 4 Components ready to use:

### TableComponent

Data grid interactions: row reading, sorting, row actions, assertions.

```typescript
// In a page that composes a TableComponent:
await myPage.dataTable.getRowCount();
await myPage.dataTable.sortByColumn('Name');
await myPage.dataTable.clickRowAction(0, 'action-delete');
await myPage.dataTable.expectRowCount(5);
await myPage.dataTable.expectRowContains(0, 'quarterly report');
```

### ModalComponent

Dialog interactions: wait, confirm, cancel, read content.

```typescript
// In a page that composes a ModalComponent:
await myPage.confirmModal.waitForVisible();
await myPage.confirmModal.confirm();
await myPage.confirmModal.expectToBeHidden();
```

### FormComponent

Form interactions: fill fields, submit, reset, read validation errors.

### ToastComponent

Notification interactions: read message, dismiss, assert type.

```typescript
// In a page that composes a ToastComponent:
await myPage.toast.expectSuccess('Saved!');
await myPage.toast.expectError(/failed/);
await myPage.toast.dismiss();
```

## What BaseComponent gives you

| Method | Purpose |
|--------|---------|
| `this.locator(selector)` | Find element relative to root |
| `isVisible()` | Check if root is visible |
| `expectToBeVisible()` | Assert root is visible |
| `expectToBeHidden()` | Assert root is hidden |
| `waitForVisible()` | Wait until root appears |
| `waitForHidden()` | Wait until root disappears |
| `this.log` | Logger scoped to the Component's class name |

## Naming conventions

| What | Convention | Example |
|------|-----------|---------|
| File | `kebab-case.component.ts` | `dropdown.component.ts` |
| Class | `PascalCase + Component` | `DropdownComponent` |
| Property in Page | Descriptive noun | `statusFilter`, `dataTable`, `confirmModal` |

