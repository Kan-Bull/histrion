import { expect as baseExpect, type Locator } from "@playwright/test";

/**
 * Custom matchers extending Playwright's expect.
 *
 * Add domain-specific assertions here to keep test code
 * expressive and reduce duplication.
 *
 * Usage in tests:
 * ```ts
 * await expect(locator).toHaveCount(5);
 * await expect(page).toHaveNotification('success', 'Saved!');
 * ```
 */
export const expect = baseExpect.extend({
  /**
   * Assert that a locator has a specific data-status attribute.
   *
   * ```ts
   * await expect(row).toHaveStatus('active');
   * ```
   */
  async toHaveStatus(locator: Locator, expected: string) {
    const assertionName = "toHaveStatus";
    let pass: boolean;
    let actual: string | null;

    try {
      await baseExpect(locator).toHaveAttribute("data-status", expected);
      pass = true;
      actual = expected;
    } catch {
      pass = false;
      actual = await locator.getAttribute("data-status");
    }

    return {
      message: () => `expected element to have status "${expected}", got "${actual}"`,
      pass,
      name: assertionName,
      expected,
      actual,
    };
  },

  /**
   * Assert that a locator's text matches a number within tolerance.
   *
   * ```ts
   * await expect(totalLabel).toHaveNumericText(99.99, 0.01);
   * ```
   */
  async toHaveNumericText(locator: Locator, expected: number, tolerance = 0.001) {
    const assertionName = "toHaveNumericText";
    const text = (await locator.textContent()) ?? "";
    const actual = Number.parseFloat(text.replace(/[^0-9.-]/g, ""));
    const pass = Math.abs(actual - expected) <= tolerance;

    return {
      message: () => `expected numeric text ${expected} (±${tolerance}), got ${actual}`,
      pass,
      name: assertionName,
      expected,
      actual,
    };
  },

  /**
   * Assert that a list of locators is sorted alphabetically.
   *
   * ```ts
   * await expect(page.locator('.name-cell')).toBeSortedAlphabetically();
   * ```
   */
  async toBeSortedAlphabetically(locator: Locator, descending = false) {
    const assertionName = "toBeSortedAlphabetically";
    const texts = await locator.allTextContents();
    const sorted = [...texts].sort((a, b) =>
      descending ? b.localeCompare(a) : a.localeCompare(b),
    );

    const pass = JSON.stringify(texts) === JSON.stringify(sorted);

    return {
      message: () =>
        `expected elements to be sorted ${descending ? "descending" : "ascending"}`,
      pass,
      name: assertionName,
      expected: sorted,
      actual: texts,
    };
  },
});
