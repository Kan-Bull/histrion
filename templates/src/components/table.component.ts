import { expect, type Locator } from "@playwright/test";
import { BaseComponent } from "../core/base.component";

/**
 * Reusable table component for any data grid in the application.
 *
 * Handles common table interactions: reading rows, sorting,
 * searching, pagination, and row-level actions.
 */
export class TableComponent extends BaseComponent {
  private readonly rows: Locator = this.locator("tbody tr");
  private readonly headers: Locator = this.locator("thead th");
  private readonly emptyState: Locator = this.locator('[data-testid="empty-state"]');

  // ──────────────────────────────────────────────
  //  Reading data
  // ──────────────────────────────────────────────

  async getRowCount(): Promise<number> {
    return this.rows.count();
  }

  async getRow(index: number): Promise<Locator> {
    return this.rows.nth(index);
  }

  async getCellText(rowIndex: number, colIndex: number): Promise<string> {
    const cell = this.rows.nth(rowIndex).locator("td").nth(colIndex);
    return (await cell.textContent()) ?? "";
  }

  async getColumnTexts(colIndex: number): Promise<string[]> {
    const count = await this.getRowCount();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push(await this.getCellText(i, colIndex));
    }
    return texts;
  }

  async getRowByText(text: string): Promise<Locator> {
    return this.rows.filter({ hasText: text });
  }

  // ──────────────────────────────────────────────
  //  Interactions
  // ──────────────────────────────────────────────

  async clickRow(index: number): Promise<void> {
    this.log.action(`Click row ${index}`);
    await this.rows.nth(index).click();
  }

  async clickRowAction(rowIndex: number, actionTestId: string): Promise<void> {
    this.log.action(`Click action "${actionTestId}" on row ${rowIndex}`);
    await this.rows.nth(rowIndex).locator(`[data-testid="${actionTestId}"]`).click();
  }

  async sortByColumn(headerText: string): Promise<void> {
    this.log.action(`Sort by column: ${headerText}`);
    await this.headers.filter({ hasText: headerText }).click();
  }

  // ──────────────────────────────────────────────
  //  Assertions
  // ──────────────────────────────────────────────

  async expectRowCount(count: number): Promise<void> {
    await expect(this.rows).toHaveCount(count);
  }

  async expectEmpty(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  async expectRowContains(rowIndex: number, text: string): Promise<void> {
    await expect(this.rows.nth(rowIndex)).toContainText(text);
  }
}
