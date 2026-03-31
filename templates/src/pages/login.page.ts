import { BasePage } from "../core/base.page";
import type { LoginCredentials } from "../data/types";

/**
 * Page Object for the Login page.
 *
 * Encapsulates all login-related interactions.
 * Tests never see selectors — only semantic methods.
 */
export class LoginPage extends BasePage {
  readonly path = "/login";
  readonly pageTitle = /Login/;

  // ── Locators (private — never exposed to tests) ──
  private readonly usernameInput = this.page.getByTestId("login-username");
  private readonly passwordInput = this.page.getByTestId("login-password");
  private readonly submitButton = this.page.getByTestId("login-submit");
  private readonly errorMessage = this.page.getByTestId("login-error");
  private readonly forgotPasswordLink = this.page.getByTestId("login-forgot-password");

  // ── Actions ──

  async loginAs(credentials: LoginCredentials): Promise<void> {
    this.log.step(`Logging in as ${credentials.username}`);
    await this.navigate();
    await this.fill(this.usernameInput, credentials.username, "username");
    await this.fill(this.passwordInput, credentials.password, "password");
    await this.click(this.submitButton, "Submit button");
    await this.waitForNavigation();
  }

  async attemptLogin(credentials: LoginCredentials): Promise<void> {
    this.log.step(`Attempting login as ${credentials.username} (expecting failure)`);
    await this.fill(this.usernameInput, credentials.username, "username");
    await this.fill(this.passwordInput, credentials.password, "password");
    await this.click(this.submitButton, "Submit button");
  }

  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordLink, "Forgot password link");
  }

  // ── Assertions ──

  async expectErrorMessage(message: string | RegExp): Promise<void> {
    const { expect } = await import("@playwright/test");
    await expect(this.errorMessage).toHaveText(message);
  }

  async expectErrorVisible(): Promise<void> {
    const { expect } = await import("@playwright/test");
    await expect(this.errorMessage).toBeVisible();
  }
}
