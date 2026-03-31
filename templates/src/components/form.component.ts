import { expect, type Locator } from "@playwright/test";
import { BaseComponent } from "../core/base.component";

/**
 * Reusable form component for any form in the application.
 *
 * Provides typed field interactions, validation error reading,
 * and submission helpers.
 */
export class FormComponent extends BaseComponent {
  private readonly submitButton: Locator = this.locator('[data-testid="form-submit"]');
  private readonly validationErrors: Locator = this.locator(
    '[data-testid="field-error"]',
  );

  // ──────────────────────────────────────────────
  //  Field interactions
  // ──────────────────────────────────────────────

  async fillField(testId: string, value: string): Promise<void> {
    this.log.action(`Fill "${testId}" with "${value}"`);
    const field = this.locator(`[data-testid="${testId}"]`);
    await field.clear();
    await field.fill(value);
  }

  async selectField(testId: string, value: string): Promise<void> {
    this.log.action(`Select "${value}" in "${testId}"`);
    await this.locator(`[data-testid="${testId}"]`).selectOption(value);
  }

  async checkField(testId: string): Promise<void> {
    this.log.action(`Check "${testId}"`);
    await this.locator(`[data-testid="${testId}"]`).check();
  }

  async uncheckField(testId: string): Promise<void> {
    this.log.action(`Uncheck "${testId}"`);
    await this.locator(`[data-testid="${testId}"]`).uncheck();
  }

  /**
   * Fill multiple fields at once from a key-value map.
   *
   * ```ts
   * await form.fillFields({
   *   'first-name': 'John',
   *   'last-name': 'Doe',
   *   'email': 'john@example.com',
   * });
   * ```
   */
  async fillFields(fields: Record<string, string>): Promise<void> {
    for (const [testId, value] of Object.entries(fields)) {
      await this.fillField(testId, value);
    }
  }

  // ──────────────────────────────────────────────
  //  Submission
  // ──────────────────────────────────────────────

  async submit(): Promise<void> {
    this.log.action("Submit form");
    await this.submitButton.click();
  }

  // ──────────────────────────────────────────────
  //  Validation
  // ──────────────────────────────────────────────

  async getValidationErrors(): Promise<string[]> {
    const count = await this.validationErrors.count();
    const errors: string[] = [];
    for (let i = 0; i < count; i++) {
      errors.push((await this.validationErrors.nth(i).textContent()) ?? "");
    }
    return errors;
  }

  async expectNoValidationErrors(): Promise<void> {
    await expect(this.validationErrors).toHaveCount(0);
  }

  async expectValidationError(message: string): Promise<void> {
    await expect(this.validationErrors.filter({ hasText: message })).toBeVisible();
  }
}
