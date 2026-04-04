# Element Extractor

## The problem

You're in Chrome DevTools looking at an element. You know you need a Playwright locator for it, but which strategy should you use? `getByRole`? `getByTestId`? `locator("#id")`? You have to mentally evaluate the attributes, check for stability, and type the locator by hand.

## The solution

Copy the element in DevTools, run one command, and get every possible locator ranked by stability:

```bash
npx histrion extract
```

That's it. The extractor reads your clipboard, parses the HTML, and shows all locator strategies with stability scores.

## Usage

### Clipboard mode (recommended)

1. Right-click an element in Chrome DevTools
2. Click **Copy** > **Copy element**
3. Run:

```bash
npx histrion extract
```

The extractor reads the HTML from your clipboard automatically. Works on macOS, Linux, and Windows.

### Inline mode

For simple, single-line elements:

```bash
npx histrion extract '<button id="login" class="btn btn-primary">Sign In</button>'
```

### Pipe mode

```bash
pbpaste | npx histrion extract          # macOS
xclip -selection clipboard -o | npx histrion extract  # Linux
powershell Get-Clipboard | npx histrion extract       # Windows
```

## Output

The extractor displays a table of all possible locators, ranked by stability:

```
  Root: <div> with text "You logged into a secure area!"

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ #  Strategy          Locator                                       Stability│
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ 1  locator#id        locator("#flash")                                🟢   │
  │ 2  getByRole         getByRole("alert", { name: "You logged in..." }) 🟡   │
  │ 3  getByText         getByText("You logged into a secure area!")      🔴   │
  │ 4  locator(css)      locator(".alert-success")                        🔴   │
  └─────────────────────────────────────────────────────────────────────────────┘
```

Stability indicators:

| Icon | Score | Meaning |
|------|-------|---------|
| Green | 4-5 | Stable and language-independent (`getByTestId`, `locator("#id")`) |
| Yellow | 3 | Good semantics, but can break on locale change (`getByRole`, `getByLabel`) |
| Red | 1-2 | Fragile, likely to break on refactors (`locator(".class")`, `getByPlaceholder`) |

## Interactive selection

When run in a terminal, the extractor prompts you to pick a locator:

```
  Select locator [1]: 2

  Copy-paste ready:
    private readonly flash = this.page.getByRole("alert", { name: "You logged into a secure area!" });
```

Press Enter to accept the default (best locator), or type a number to select a different one.

## Child elements

When you copy a parent element from DevTools, it includes the full subtree. The extractor analyzes **all** elements — root and children — and shows locators for each one that has meaningful attributes:

```
  Root: <div> with text "You logged into a secure area!"

  ┌──────────────────────────────────────────────┐
  │ 1  locator#id   locator("#flash")        🟢  │
  │ 2  getByRole    getByRole("alert", ...)  🟡  │
  └──────────────────────────────────────────────┘

  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

  1 child element found:

  Child: <button>

  ┌──────────────────────────────────────────────────────────┐
  │ 3  getByRole    getByRole("button", { name: "Close" })  🟡  │
  │ 4  locator(css) locator(".btn-close")                   🔴  │
  └──────────────────────────────────────────────────────────┘
```

Numbering is global across all elements, so you can select any locator — root or child — from the same prompt.

Elements with no meaningful attributes (bare `<b>`, `<span>`, layout wrappers) are filtered out automatically.

## Locator ranking

The extractor uses the same ranking logic as the page scanner:

| Priority | Strategy | Score | Source |
|----------|----------|-------|--------|
| 1 | `getByTestId()` | 5 | `data-testid`, `data-test`, `data-cy`, `data-qa` |
| 2 | `locator("#id")` | 4 | `id` attribute (skips generated IDs like UUIDs) |
| 3 | `getByRole()` | 3 | Explicit `role` or implicit role from tag (button, link, textbox...) |
| 4 | `getByLabel()` | 3 | `aria-label` attribute |
| 5 | `getByPlaceholder()` | 2 | `placeholder` attribute |
| 6 | `getByText()` | 2 | Visible text content |
| 7 | `locator("[name]")` | 1 | `name` attribute |
| 8 | `locator(".class")` | 1 | CSS classes (utility classes like `mt-3`, `d-flex` are filtered out) |

## CSS class filtering

Not all classes make good locators. The extractor filters out common utility classes:

- **Spacing** — `mt-3`, `px-4`, `mb-2`, etc.
- **Display** — `d-flex`, `hidden`, `show`, `fade`, `collapse`
- **Styling** — `text-center`, `bg-primary`, `rounded`, `shadow`
- **State** — `active`, `disabled`, `hover`, `selected`
- **Layout** — `col-6`, `row`, `container`

Only semantic classes (like `alert-success`, `btn-close`, `form-control`) are suggested as locators.

## Works standalone

Like the scanner, the extractor doesn't require a Histrion project. Run it from anywhere to quickly evaluate locator options for any HTML element.
