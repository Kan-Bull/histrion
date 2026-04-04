# Custom HTML Reporter

## The problem

Playwright's default HTML reporter works, but it's generic. You can't filter by tag, the layout isn't optimized for large test suites, and there's no way to auto-open it only when something fails.

## The solution

Histrion ships a custom single-file HTML reporter with a dark-mode dashboard, status filtering, tag display, and configurable auto-open behavior.

## Configuration

Add it to your `playwright.config.ts`:

```typescript
reporter: [
  ['./src/reporters/html-report.ts', {
    outputFile: 'reports/results.html',
    open: 'on-failure', // 'always' | 'never' | 'on-failure'
  }],
],
```

| Option | Default | Description |
|--------|---------|-------------|
| `outputFile` | `reports/test-report.html` | Path to the generated HTML file |
| `open` | `never` | When to auto-open the report in a browser |

## What the report shows

The generated HTML includes:

- **Dashboard cards** — total, passed, failed, and skipped counts at a glance
- **Filter bar** — click All, Passed, Failed, or Skipped to show only those tests
- **Results table** — suite name, test title, status badge, duration, tags, and error details
- **Error details** — failed tests show the full error message in a scrollable code block

Everything is in a single `.html` file with inline CSS and JavaScript — no external dependencies, easy to share or attach to CI artifacts.

## Auto-open behavior

The `open` option controls when the report opens in your default browser after a run:

| Value | Behavior |
|-------|----------|
| `always` | Opens after every run |
| `on-failure` | Opens only when at least one test failed |
| `never` | Never opens automatically (default) |

Platform-aware: uses `open` on macOS, `start` on Windows, `xdg-open` on Linux.

## Using with other reporters

You can combine the custom reporter with Playwright's built-in reporters:

```typescript
reporter: [
  ['list'],
  ['./src/reporters/html-report.ts', {
    outputFile: 'reports/results.html',
    open: 'on-failure',
  }],
],
```

This gives you live terminal output (`list`) and an HTML report on disk.

## Tags in the report

If your tests use tags (`@smoke`, `@regression`, etc.), they appear as badges in the Tags column:

```typescript
test('user can log in @smoke', async ({ loginPage }) => {
  // ...
});
```

This makes it easy to scan the report for which test categories failed.

## Customizing the report

The reporter is a plain TypeScript file at `src/reporters/html-report.ts`. You own it — modify it freely:

- **Colors** — edit the CSS variables in `:root` (`--pass`, `--fail`, `--skip`, `--bg`, `--card`)
- **Layout** — change the grid, add columns, rearrange sections
- **Data** — the `TestEntry` interface defines what's captured per test; add fields like browser, project name, or screenshots
- **Title** — change the `<title>` and `<h1>` to match your project

## CI integration

In CI, set `open: 'never'` and upload the report as an artifact:

```yaml
# .github/workflows/playwright.yml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-report
    path: reports/results.html
    retention-days: 14
```

## How it works internally

The reporter implements Playwright's `Reporter` interface with three hooks:

1. **`onBegin`** — records the start time
2. **`onTestEnd`** — collects each test's title, suite, status, duration, tags, error message, and retry count
3. **`onEnd`** — generates the HTML, writes it to disk, and optionally opens it

The `generateHTML` method builds the full HTML string with inline styles and scripts. The filter bar uses a simple JavaScript function that toggles row visibility by CSS class (`status-passed`, `status-failed`, `status-skipped`).
