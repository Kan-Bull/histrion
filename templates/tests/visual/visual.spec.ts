import { test } from "../../src/fixtures";
import { compareFullPage } from "../../src/utils/visual";

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
  // test("my page matches snapshot", async ({ examplePage }) => {
  //   await examplePage.navigate();
  //
  //   await compareFullPage(examplePage.page, "my-page-full");
  // });
});
