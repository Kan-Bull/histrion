import { expect, type Locator, type Page } from "@playwright/test";
import { Logger } from "../utils/logger";

/**
 * Abstract base class for reusable UI components.
 *
 * Components represent self-contained UI elements that appear across
 * multiple pages: tables, modals, forms, toasts, dropdowns, etc.
 *
 * A Component is always scoped to a root Locator, ensuring all
 * interactions are contextual and isolated.
 *
 * Usage in a Page Object:
 * ```ts
 * class MyPage extends BasePage {
 *   readonly dataTable = new TableComponent(this.page, this.page.locator('[data-testid="main-table"]'));
 *   readonly toast = new ToastComponent(this.page, this.page.locator('[role="alert"]'));
 * }
 * ```
 */
export abstract class BaseComponent {
  protected readonly log: Logger;

  constructor(
    protected readonly page: Page,
    protected readonly root: Locator,
  ) {
    this.log = new Logger(this.constructor.name);
  }

  /** Locate an element relative to this component's root */
  protected locator(selector: string): Locator {
    return this.root.locator(selector);
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  async expectToBeVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async expectToBeHidden(): Promise<void> {
    await expect(this.root).toBeHidden();
  }

  async waitForVisible(): Promise<void> {
    await this.root.waitFor({ state: "visible" });
  }

  async waitForHidden(): Promise<void> {
    await this.root.waitFor({ state: "hidden" });
  }
}
