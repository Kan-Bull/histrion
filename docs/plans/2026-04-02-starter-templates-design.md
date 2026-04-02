# Starter template files — Design

## Goal

Replace the contact-form examples (tied to practicesoftwaretesting.com) with generic boilerplate skeleton files that users fill in with their own app's locators, actions, and assertions. These are starter files, not demos.

## Files to create (in `templates/`)

### `src/data/types/example.ts`
- Skeleton `ExampleData` interface with commented-out field examples
- Exported from `src/data/types/index.ts`

### `src/pages/example.page.ts`
- Extends `BasePage`, sets placeholder `path` and `pageTitle`
- Three canonical sections (Locators / Actions / Assertions) with commented-out examples showing the technique
- Imports `ExampleData` type

### `src/fixtures/index.ts` (modified)
- Wired with `ExamplePage` out of the box
- Single-file pattern preserved (no separate fixture file)

### `tests/e2e/example.spec.ts`
- `describe` block with `beforeEach` navigation
- Commented-out test body showing the pattern

## Files to remove

- `templates/src/pages/contact.page.ts`
- `templates/src/data/builders/contact.builder.ts`
- `templates/tests/e2e/contact.spec.ts`
- `ContactFormData` / `ContactSubject` from `templates/src/data/types/index.ts`

## Scaffolding logic changes (`src/index.ts`)

- Prompt text: "Include starter template files?" (no mention of Contact/practicesoftwaretesting)
- `includeExamples: false` → remove `example.page.ts`, `example.spec.ts`, `example.ts` type, reset fixtures to empty shell
- Drop all contact-specific cleanup code
- Builder/Faker remains a separate orthogonal option
- `!includeFaker && includeExamples` no longer needs to remove `contact.builder.ts`

## Principles

- Fully commented-out body — zero assumptions about the user's domain
- Every comment is valid code the user can uncomment and adapt
- Files compile as-is (empty class is valid)
- Aligned with `docs/15-writing-your-first-test.md` structure
