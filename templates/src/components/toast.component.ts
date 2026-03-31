import { expect, type Locator } from "@playwright/test";
import { BaseComponent } from "../core/base.component";

/**
 * Reusable toast/notification component.
 *
 * Handles reading, dismissing, and asserting on
 * toast notifications that appear in the application.
 */
export class ToastComponent extends BaseComponent {
  private readonly message: Locator = this.locator('[data-testid="toast-message"]');
  private readonly dismissButton: Locator = this.locator('[data-testid="toast-dismiss"]');

  async getMessage(): Promise<string> {
    await this.waitForVisible();
    return (await this.message.textContent()) ?? "";
  }

  async dismiss(): Promise<void> {
    this.log.action("Dismiss toast");
    await this.dismissButton.click();
    await this.waitForHidden();
  }

  async expectMessage(expected: string | RegExp): Promise<void> {
    await this.waitForVisible();
    await expect(this.message).toHaveText(expected);
  }

  async expectSuccess(message?: string | RegExp): Promise<void> {
    await expect(this.root).toHaveAttribute("data-type", "success");
    if (message) await this.expectMessage(message);
  }

  async expectError(message?: string | RegExp): Promise<void> {
    await expect(this.root).toHaveAttribute("data-type", "error");
    if (message) await this.expectMessage(message);
  }
}
