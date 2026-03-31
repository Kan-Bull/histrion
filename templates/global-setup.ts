import { chromium, type FullConfig } from "@playwright/test";
import { EnvConfig } from "./src/config/env.config";
import { users } from "./src/config/users.config";
import { Logger } from "./src/utils/logger";

const log = new Logger("GlobalSetup");

/**
 * Global setup runs once before all tests.
 *
 * Primary responsibility: authenticate test users and save
 * their browser state (cookies, localStorage) to disk so that
 * individual tests can skip the login flow entirely.
 *
 * The stored state is referenced in playwright.config.ts via
 * `storageState` in each project.
 */
async function globalSetup(_config: FullConfig): Promise<void> {
  log.step("Starting global setup");

  const browser = await chromium.launch();

  // ── Authenticate: admin user ──
  await authenticateUser(browser, users.admin, "auth/admin.json");

  // ── Authenticate: standard user ──
  await authenticateUser(browser, users.standard, "auth/standard.json");

  await browser.close();
  log.step("Global setup complete");
}

async function authenticateUser(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  user: { username: string; password: string },
  storagePath: string,
): Promise<void> {
  log.step(`Authenticating ${user.username}`);

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${EnvConfig.baseUrl}/login`);
  await page.getByTestId("login-username").fill(user.username);
  await page.getByTestId("login-password").fill(user.password);
  await page.getByTestId("login-submit").click();
  await page.waitForLoadState("networkidle");

  await context.storageState({ path: storagePath });
  await context.close();
}

export default globalSetup;
