import { users } from "../../src/config/users.config";
import { test } from "../../src/fixtures";

/**
 * Login feature tests.
 *
 * Notice: no selectors, no page.click(), no implementation details.
 * Tests read like specifications — they describe WHAT, not HOW.
 */
test.describe("Login @smoke", () => {
  test("should login successfully with valid credentials", async ({
    loginPage,
    dashboardPage,
  }) => {
    await loginPage.loginAs(users.admin);
    await dashboardPage.expectToBeVisible();
    await dashboardPage.expectWelcomeMessage(users.admin.displayName);
  });

  test("should display error for invalid credentials", async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.attemptLogin({
      username: "invalid@example.com",
      password: "wrong-password",
    });
    await loginPage.expectErrorMessage(/Invalid credentials/);
  });

  test("should navigate to forgot password", async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.clickForgotPassword();
    // Assert navigation happened — extend with ForgotPasswordPage POM
  });
});
