import { expect, type Locator } from "@playwright/test";
import { BaseComponent } from "../core/base.component";

/**
 * Reusable modal/dialog component.
 *
 * Handles opening, closing, confirming, and interacting
 * with modal dialogs across the application.
 */
export class ModalComponent extends BaseComponent {
  private readonly title: Locator = this.locator('[data-testid="modal-title"]');
  private readonly closeButton: Locator = this.locator('[data-testid="modal-close"]');
  private readonly confirmButton: Locator = this.locator('[data-testid="modal-confirm"]');
  private readonly cancelButton: Locator = this.locator('[data-testid="modal-cancel"]');
  private readonly body: Locator = this.locator('[data-testid="modal-body"]');

  // ──────────────────────────────────────────────
  //  Interactions
  // ──────────────────────────────────────────────

  async confirm(): Promise<void> {
    this.log.action("Confirm modal");
    await this.confirmButton.click();
    await this.waitForHidden();
  }

  async cancel(): Promise<void> {
    this.log.action("Cancel modal");
    await this.cancelButton.click();
    await this.waitForHidden();
  }

  async close(): Promise<void> {
    this.log.action("Close modal");
    await this.closeButton.click();
    await this.waitForHidden();
  }

  async getTitle(): Promise<string> {
    return (await this.title.textContent()) ?? "";
  }

  async getBodyText(): Promise<string> {
    return (await this.body.textContent()) ?? "";
  }

  // ──────────────────────────────────────────────
  //  Assertions
  // ──────────────────────────────────────────────

  async expectTitle(expected: string | RegExp): Promise<void> {
    await expect(this.title).toHaveText(expected);
  }

  async expectBodyContains(text: string): Promise<void> {
    await expect(this.body).toContainText(text);
  }
}
