import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

const DEFAULT_THRESHOLD = 0.2;
const DEFAULT_MAX_DIFF_PIXELS = 100;

/**
 * Visual regression testing utilities.
 *
 * Wraps Playwright's screenshot comparison with sensible defaults
 * and common masking patterns (dynamic content, timestamps, avatars).
 *
 * Usage in visual spec files:
 * ```ts
 * import { compareFullPage, dynamicContentMasks } from '../../src/utils/visual';
 *
 * test('dashboard matches snapshot', async ({ dashboardPage }) => {
 *   await dashboardPage.navigate();
 *   await compareFullPage(dashboardPage.page, 'dashboard');
 * });
 * ```
 */

/**
 * Full-page screenshot comparison.
 */
export async function compareFullPage(
  page: Page,
  name: string,
  options: {
    mask?: Locator[];
    maxDiffPixelRatio?: number;
    threshold?: number;
  } = {},
): Promise<void> {
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: true,
    mask: options.mask ?? [],
    maxDiffPixelRatio: options.maxDiffPixelRatio ?? DEFAULT_MAX_DIFF_PIXELS,
    threshold: options.threshold ?? DEFAULT_THRESHOLD,
    animations: "disabled",
  });
}

/**
 * Element-level screenshot comparison.
 */
export async function compareElement(
  locator: Locator,
  name: string,
  options: {
    mask?: Locator[];
    threshold?: number;
  } = {},
): Promise<void> {
  await expect(locator).toHaveScreenshot(`${name}.png`, {
    threshold: options.threshold ?? DEFAULT_THRESHOLD,
    mask: options.mask ?? [],
    animations: "disabled",
  });
}

/**
 * Returns common locators to mask during visual comparison.
 * Override or extend in your project as needed.
 */
export function dynamicContentMasks(page: Page): Locator[] {
  return [
    page.locator('[data-testid="timestamp"]'),
    page.locator('[data-testid="avatar"]'),
    page.locator('[data-testid="dynamic-id"]'),
    page.locator("time"),
  ];
}
