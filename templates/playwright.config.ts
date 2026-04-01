import { defineConfig, devices } from "@playwright/test";
import { EnvConfig } from "./src/config/env.config";

/**
 * Playwright configuration.
 *
 * Environment-aware: all timeouts, retries, and workers are
 * driven by EnvConfig based on the TEST_ENV variable.
 *
 * Usage:
 *   TEST_ENV=staging npx playwright test
 *   TEST_ENV=staging npx playwright test --grep @smoke
 */
export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",

  /* Execution */
  fullyParallel: true,
  workers: EnvConfig.workers,
  retries: EnvConfig.retries,
  timeout: EnvConfig.timeout,
  forbidOnly: !!process.env.CI,

  /* Global setup: creates required directories */
  globalSetup: require.resolve("./global-setup"),

  /* Expectations */
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },

  /* Reporters */
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "reports/playwright-html" }],
    [
      "./src/reporters/html-report.ts",
      { open: "on-failure", outputFile: "reports/custom-report.html" },
    ],
  ],

  /* Shared settings for all projects */
  use: {
    baseURL: EnvConfig.baseUrl,
    testIdAttribute: "data-test",
    headless: EnvConfig.headless,

    /* Traces & evidence */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",

    /* Navigation */
    actionTimeout: 10_000,
    navigationTimeout: 30_000,

    /* Browser context */
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    locale: "en-US",
    timezoneId: "Europe/Brussels",
  },

  projects: [
    // -- E2E tests: authenticated as admin --
    {
      name: "e2e-admin",
      testDir: "./tests/e2e",
      use: {
        ...devices["Desktop Chrome"],
        // storageState: "auth/admin.json",
      },
    },

    // -- E2E tests: authenticated as standard user --
    {
      name: "e2e-user",
      testDir: "./tests/e2e",
      grep: /@user/,
      use: {
        ...devices["Desktop Chrome"],
        // storageState: "auth/standard.json",
      },
    },

    // -- Visual regression --
    {
      name: "visual",
      testDir: "./tests/visual",
      use: {
        ...devices["Desktop Chrome"],
        // storageState: "auth/admin.json",
      },
    },

    // -- Mobile viewport --
    {
      name: "mobile",
      testDir: "./tests/e2e",
      grep: /@mobile/,
      use: {
        ...devices["iPhone 14"],
        // storageState: "auth/standard.json",
      },
    },
  ],
});
