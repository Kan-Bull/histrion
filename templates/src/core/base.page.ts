import { expect, type Locator, type Page } from "@playwright/test";
import { Logger } from "../utils/logger";

/**
 * Abstract base class for all Page Objects.
 *
 * Every page in the application extends BasePage and inherits:
 * - Navigation helpers with configurable wait strategies
 * - Common interaction patterns (click, fill, select)
 * - Built-in logging for every action
 * - Assertion helpers scoped to the page
 *
 * Subclasses MUST define `path` and `pageTitle` for identity.
 */
export abstract class BasePage {
  protected readonly log: Logger;

  /** Relative path from baseURL (e.g. '/dashboard') */
  abstract readonly path: string;

  /** Expected document title — used to verify correct page loaded */
  abstract readonly pageTitle: string | RegExp;

  constructor(protected readonly page: Page) {
    this.log = new Logger(this.constructor.name);
  }

  // ──────────────────────────────────────────────
  //  Navigation
  // ──────────────────────────────────────────────

  async navigate(): Promise<this> {
    this.log.step(`Navigating to ${this.path}`);
    await this.page.goto(this.path, { waitUntil: "domcontentloaded" });
    await this.waitForPageReady();
    return this;
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  async expectToBeVisible(): Promise<void> {
    this.log.step(`Verifying page title matches: ${this.pageTitle}`);
    await expect(this.page).toHaveTitle(this.pageTitle);
  }

  // ──────────────────────────────────────────────
  //  Common interactions
  // ──────────────────────────────────────────────

  protected async click(locator: Locator, description: string): Promise<void> {
    this.log.action(`Click: ${description}`);
    await locator.click();
  }

  protected async fill(
    locator: Locator,
    value: string,
    description: string,
  ): Promise<void> {
    this.log.action(`Fill "${description}" with "${value}"`);
    await locator.clear();
    await locator.fill(value);
  }

  protected async selectOption(
    locator: Locator,
    value: string,
    description: string,
  ): Promise<void> {
    this.log.action(`Select "${value}" in "${description}"`);
    await locator.selectOption(value);
  }

  protected async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) ?? "";
  }

  protected async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  // ──────────────────────────────────────────────
  //  Waits
  // ──────────────────────────────────────────────

  protected async waitForSelector(
    selector: string,
    state: "visible" | "hidden" = "visible",
  ): Promise<void> {
    await this.page.waitForSelector(selector, { state });
  }

  protected async waitForResponse(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForResponse(urlPattern);
  }

  protected async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  // ──────────────────────────────────────────────
  //  Screenshots & debugging
  // ──────────────────────────────────────────────

  async takeScreenshot(name: string): Promise<Buffer> {
    this.log.step(`Taking screenshot: ${name}`);
    return this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true,
    });
  }
}
