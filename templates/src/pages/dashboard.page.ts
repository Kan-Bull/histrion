import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { ModalComponent } from "../components/modal.component";
import { TableComponent } from "../components/table.component";
import { ToastComponent } from "../components/toast.component";
import { BasePage } from "../core/base.page";

/**
 * Page Object for the Dashboard page.
 *
 * Demonstrates the composition pattern: a Page is built from
 * reusable Components. The Page orchestrates, Components interact.
 */
export class DashboardPage extends BasePage {
  readonly path = "/dashboard";
  readonly pageTitle = /Dashboard/;

  // ── Composed components ──
  readonly dataTable: TableComponent;
  readonly confirmModal: ModalComponent;
  readonly toast: ToastComponent;

  // ── Page-specific locators ──
  private readonly welcomeMessage = this.page.getByTestId("welcome-message");
  private readonly createButton = this.page.getByTestId("create-new");
  private readonly searchInput = this.page.getByTestId("search-input");
  private readonly navItems = this.page.getByTestId("nav-item");

  constructor(page: Page) {
    super(page);
    this.dataTable = new TableComponent(page, page.getByTestId("data-table"));
    this.confirmModal = new ModalComponent(page, page.getByTestId("confirm-modal"));
    this.toast = new ToastComponent(page, page.getByTestId("toast"));
  }

  // ── Actions ──

  async searchFor(query: string): Promise<void> {
    this.log.step(`Searching for: ${query}`);
    await this.fill(this.searchInput, query, "search");
    await this.page.keyboard.press("Enter");
    await this.page.waitForLoadState("networkidle");
  }

  async clickCreate(): Promise<void> {
    await this.click(this.createButton, "Create new");
  }

  async navigateTo(section: string): Promise<void> {
    this.log.step(`Navigating to section: ${section}`);
    await this.navItems.filter({ hasText: section }).click();
    await this.waitForNavigation();
  }

  async deleteRow(index: number): Promise<void> {
    this.log.step(`Deleting row ${index}`);
    await this.dataTable.clickRowAction(index, "action-delete");
    await this.confirmModal.waitForVisible();
    await this.confirmModal.confirm();
    await this.toast.expectSuccess();
  }

  // ── Assertions ──

  async expectWelcomeMessage(name: string): Promise<void> {
    await expect(this.welcomeMessage).toContainText(name);
  }

  async expectSearchResults(count: number): Promise<void> {
    await this.dataTable.expectRowCount(count);
  }
}
