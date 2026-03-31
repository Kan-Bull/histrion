import { test } from "../../src/fixtures";
import {
  compareElement,
  compareFullPage,
  dynamicContentMasks,
} from "../../src/utils/visual";

/**
 * Visual regression tests.
 *
 * These capture full-page or element screenshots and compare
 * against stored baselines. Dynamic content (timestamps, avatars)
 * is automatically masked.
 *
 * Update baselines:
 *   npx playwright test --project=visual --update-snapshots
 */
test.describe("Visual Regression @visual", () => {
  test("dashboard page matches snapshot", async ({ dashboardPage }) => {
    await dashboardPage.navigate();

    await compareFullPage(dashboardPage.page, "dashboard-full", {
      mask: dynamicContentMasks(dashboardPage.page),
    });
  });

  test("data table component matches snapshot", async ({ dashboardPage }) => {
    await dashboardPage.navigate();

    await compareElement(dashboardPage.dataTable.root, "dashboard-data-table");
  });

  test("login page matches snapshot", async ({ loginPage }) => {
    await loginPage.navigate();

    await compareFullPage(loginPage.page, "login-full");
  });
});
