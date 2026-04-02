# Biome — Linting & Formatting

## What is Biome?

[Biome](https://biomejs.dev/) is a fast, all-in-one toolchain for JavaScript and TypeScript. It replaces **both ESLint and Prettier** with a single tool that handles linting, formatting, and import sorting.

It's written in Rust, which makes it orders of magnitude faster than the Node.js-based alternatives — we're talking milliseconds instead of seconds on a typical project.

## Why Biome instead of ESLint + Prettier?

| Concern | ESLint + Prettier | Biome |
|---------|-------------------|-------|
| **Tools to install** | 2 tools + plugins + shared configs | 1 tool, zero plugins |
| **Config files** | `.eslintrc`, `.prettierrc`, possible conflicts between them | Single `biome.json` |
| **Speed** | Seconds on medium projects | Milliseconds |
| **Rule conflicts** | Eslint and Prettier can fight over formatting — needs `eslint-config-prettier` to mediate | No conflicts — one tool owns both |
| **Import sorting** | Needs a plugin (`eslint-plugin-import`) | Built-in |
| **TypeScript support** | Needs `@typescript-eslint/parser` + plugin | Built-in |

In short: fewer dependencies, fewer config files, faster feedback, zero conflicts.

## Available scripts

| Script | What it does |
|--------|-------------|
| `npm run lint` | Check all files (lint + format) without modifying them |
| `npm run lint:fix` | Auto-fix all issues and format in place |
| `npm run format` | Format only (no lint rules) |

## The default configuration

The scaffolded `biome.json` ships with sensible defaults:

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "assist": { "actions": { "source": { "organizeImports": "on" } } },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 90
  },
  "linter": {
    "rules": {
      "recommended": true,
      "complexity": { "noForEach": "off" },
      "suspicious": { "noExplicitAny": "warn" },
      "style": {
        "noNonNullAssertion": "warn",
        "useConst": "error",
        "useTemplate": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  }
}
```

Key choices:
- **VCS-aware** — respects `.gitignore` so it skips `node_modules/`, `reports/`, etc.
- **Auto-organizes imports** — groups and sorts on save / fix
- **Recommended rules enabled** — catches real bugs out of the box
- **Unused variables and imports are errors** — keeps the codebase clean
- **`noForEach` disabled** — arrays with `.forEach()` are fine in test code
- **`noExplicitAny` is a warning** — nudges toward proper types without blocking

## Customizing to your taste

### Formatting preferences

Edit the `formatter` and `javascript.formatter` sections in `biome.json`:

```json
{
  "formatter": {
    "indentStyle": "tab",
    "indentWidth": 4,
    "lineWidth": 120
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "none"
    }
  }
}
```

Common options:

| Option | Values | Default |
|--------|--------|---------|
| `indentStyle` | `"space"`, `"tab"` | `"space"` |
| `indentWidth` | `2`, `4`, etc. | `2` |
| `lineWidth` | any number | `90` |
| `quoteStyle` | `"single"`, `"double"` | `"double"` |
| `semicolons` | `"always"`, `"asNeeded"` | `"always"` |
| `trailingCommas` | `"all"`, `"none"`, `"es5"` | `"all"` |

### Adjusting lint rules

Turn rules on, off, or set them to warn:

```json
{
  "linter": {
    "rules": {
      "recommended": true,
      "style": {
        "useConst": "off",
        "noNonNullAssertion": "off"
      },
      "complexity": {
        "noForEach": "error"
      }
    }
  }
}
```

The three severity levels:
- `"error"` — fails the lint check (blocks CI)
- `"warn"` — shows a warning but doesn't fail
- `"off"` — disables the rule entirely

Browse all available rules at [biomejs.dev/linter/rules](https://biomejs.dev/linter/rules/).

### Ignoring specific files

Add paths to the `files.includes` array with `!` prefix to exclude them:

```json
{
  "files": {
    "includes": [
      "**",
      "!**/node_modules",
      "!**/generated",
      "!**/legacy-code"
    ]
  }
}
```

### Inline suppression

Suppress a rule for a specific line:

```typescript
// biome-ignore lint/suspicious/noExplicitAny: third-party API returns unknown shape
const response: any = await externalApi.fetch();
```

Always include the reason after the colon — it's required by Biome and serves as documentation.

## Keeping your config personal with `.gitignore`

Your team may disagree on tabs vs. spaces, single vs. double quotes, or semicolons. That's fine — **formatting preferences don't need to be shared**.

To let each developer use their own Biome config without affecting others:

**1. Add `biome.json` to `.gitignore`:**

```gitignore
# Personal Biome config (each dev can customize)
biome.json
```

**2. Keep a shared baseline as `biome.json.example`:**

```bash
cp biome.json biome.json.example
git add biome.json.example
```

New developers copy the example and tweak it:

```bash
cp biome.json.example biome.json
```

This way:
- Everyone has a working config out of the box
- Individual preferences don't create noisy diffs
- The linting rules stay consistent (only formatting varies)

> **Alternative approach:** If your team wants strict consistency (e.g. for CI enforcement), keep `biome.json` committed and don't gitignore it. The tradeoff is that formatting changes produce diffs that affect everyone.

## Editor integration

### VS Code

Install the [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) and add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit"
  }
}
```

### JetBrains (WebStorm / IntelliJ)

Biome is supported natively since WebStorm 2024.2. Go to **Settings > Languages & Frameworks > Biome** and enable it.

### Other editors

See [biomejs.dev/guides/integrate-in-editor](https://biomejs.dev/guides/integrate-in-editor/) for Neovim, Helix, Zed, and others.

## CI integration

The scaffolded GitHub Actions workflow already runs `npm run lint` on every push. If Biome finds errors, the pipeline fails.

To auto-fix and commit formatting changes in CI (optional):

```yaml
- name: Fix lint issues
  run: npm run lint:fix

- name: Commit fixes
  run: |
    git diff --quiet || (git add -A && git commit -m "style: auto-fix lint issues")
```
