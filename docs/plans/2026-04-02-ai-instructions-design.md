# AI Agent Instructions — Design

## Goal

Scaffold `.md` instruction files for AI coding assistants (Copilot, Claude Code, Cursor, Windsurf) during `histrion create`, so AI tools follow the project's architecture and best practices strictly.

## Approach

- Multi-select prompt during `histrion create` — user picks which AI tools to generate files for
- Identical content across all tools, different filenames/paths
- Single source template in `templates/` copied to the right paths during scaffolding
- Content encodes the full architecture rules: POM, private locators, fixtures, builders, naming conventions, golden rule

## File mapping

| Tool | File path |
|------|-----------|
| GitHub Copilot | `.github/copilot-instructions.md` |
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursorrules` |
| Windsurf | `.windsurfrules` |

## Content structure

Single markdown document covering:
- Architecture overview (7 layers, dependency direction)
- The golden rule (tests never contain selectors)
- Writing tests (imports, fixtures, tags, one-behavior-per-test)
- Writing Page Objects (BasePage, private locators, logger, assertions)
- Naming conventions (files, classes, methods)
- Adding a new page workflow (type → page → fixture → test)
- Fixtures registration
- Data builders (fluent pattern)
- Explicit "what NOT to do" section

## Scaffolding logic

- New `includeAiInstructions` field in `ProjectConfig` (string array)
- `multiselect` prompt type from `prompts` library
- After scaffold, write template content to each selected path
- Copilot path reuses `.github/` directory (created by CI option or standalone)
- No cleanup needed when deselected — files simply aren't created
- Update `printStructure` to show AI instructions when present
