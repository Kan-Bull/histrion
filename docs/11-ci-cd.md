# CI/CD

## The GitHub Actions workflow

The file `.github/workflows/playwright.yml` runs your tests in CI. It has two jobs: `test` (run tests) and `report` (publish results).

## Triggers

| Trigger | When |
|---------|------|
| `push` to `main` or `develop` | Every push to these branches |
| `pull_request` to `main` | Every PR targeting main |
| `workflow_dispatch` | Manual trigger from GitHub Actions UI |

Manual dispatch lets you choose:
- **Environment** — `dev` or `staging`
- **Project** — `e2e-admin`, `e2e-user`, `visual`, or `mobile`

## Secrets

The workflow needs 4 secrets configured in your repository settings (`Settings → Secrets and variables → Actions`):

| Secret | Purpose |
|--------|---------|
| `ADMIN_USER` | Admin test account username |
| `ADMIN_PASS` | Admin test account password |
| `STANDARD_USER` | Standard test account username |
| `STANDARD_PASS` | Standard test account password |

These are passed to the test runner as environment variables. `global-setup.ts` uses them to authenticate test users.

> [!tip] Never commit credentials
> These values should only exist in GitHub Secrets. The `.env` file with fallback defaults is for local development only.

## Matrix strategy

By default, the workflow runs two projects in parallel:

```yaml
matrix:
  project: ["e2e-admin", "visual"]
```

When triggered manually with a specific project, only that project runs.

`fail-fast: false` ensures all projects run to completion even if one fails — you get the full picture, not just the first failure.

## What the workflow does

```
1. Checkout code
2. Setup Node.js 20 with npm cache
3. npm ci (clean install)
4. Install Playwright Chromium
5. Create auth/ directory
6. Run tests for each matrix project
7. Upload test reports as artifacts
8. Upload visual diff screenshots (on failure)
9. Deploy HTML report to GitHub Pages (main branch only)
```

## Artifacts

Two types of artifacts are uploaded after each run:

### Test reports

Uploaded for every run (pass or fail), retained for 14 days:

```yaml
- name: Upload test report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-report-${{ matrix.project }}
    path: |
      reports/
      test-results/
    retention-days: 14
```

Contains HTML reports, traces, screenshots, and videos.

### Visual diffs

Uploaded only when visual tests fail, retained for 7 days:

```yaml
- name: Upload visual snapshots
  uses: actions/upload-artifact@v4
  if: matrix.project == 'visual' && failure()
  with:
    name: visual-diff-${{ matrix.project }}
    path: test-results/**/*.png
    retention-days: 7
```

Contains expected, actual, and diff screenshots for failed visual comparisons.

## GitHub Pages report

On pushes to `main`, the `report` job deploys the Playwright HTML report to GitHub Pages:

```yaml
- name: Deploy report to GitHub Pages
  if: github.ref == 'refs/heads/main'
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: all-reports/reports/playwright-html
```

> [!tip] Enable GitHub Pages
> For this to work, enable GitHub Pages in your repository settings with source set to "GitHub Actions" or the `gh-pages` branch.

## Customizing the workflow

### Add a new project to the matrix

```yaml
matrix:
  project: ["e2e-admin", "e2e-user", "visual", "mobile"]
```

### Change the default environment

```yaml
env:
  TEST_ENV: ${{ inputs.environment || 'staging' }}
```

### Add Slack notifications

Add a step after the test job:

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    channel-id: 'C0123456'
    slack-message: 'Tests failed on ${{ github.ref_name }}'
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_TOKEN }}
```

### Run on a schedule

Add a cron trigger:

```yaml
on:
  schedule:
    - cron: '0 6 * * 1-5'  # 6 AM UTC, weekdays
```

