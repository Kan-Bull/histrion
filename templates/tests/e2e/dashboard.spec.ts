import { expect, test } from "../../src/fixtures";

/**
 * Dashboard feature tests.
 *
 * Demonstrates:
 * - Component composition (table, modal, toast)
 * - Tag-based filtering (@smoke, @regression, @user)
 * - Clean assertion chains
 */
test.describe("Dashboard @regression", () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test("should display data table with results", async ({ dashboardPage }) => {
    await dashboardPage.dataTable.expectToBeVisible();
  });

  test("should search and filter results", async ({ dashboardPage }) => {
    await dashboardPage.searchFor("quarterly report");
    await dashboardPage.expectSearchResults(3);
    await dashboardPage.dataTable.expectRowContains(0, "quarterly report");
  });

  test("should delete a row with confirmation @critical", async ({ dashboardPage }) => {
    const initialCount = await dashboardPage.dataTable.getRowCount();
    await dashboardPage.deleteRow(0);
    await dashboardPage.dataTable.expectRowCount(initialCount - 1);
  });

  test("should sort table by column", async ({ dashboardPage }) => {
    await dashboardPage.dataTable.sortByColumn("Name");
    // Use custom matcher from custom-matchers.ts
    const names = dashboardPage.dataTable.rows.locator("td:first-child");
    await expect(names).toBeSortedAlphabetically();
  });
});
