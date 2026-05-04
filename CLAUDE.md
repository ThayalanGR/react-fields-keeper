# CLAUDE.md

This file provides Claude Code with project context and behavioral rules for this repository.

---

## Project Overview

**react-fields-keeper** is a flexible bucket-based data assignment library for React. It provides drag-and-drop field assignment UI components built on React 18 + TypeScript, distributed as an ES module via npm.

- **Entry:** `src/index.ts`
- **Library build:** `library.vite.config.ts` → `dist/`
- **Dev/demo app:** `src/App.tsx` (showcases examples from `src/Examples/`)

---

## Tech Stack

| Concern | Tool |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 4 (`vite.config.ts` for dev, `library.vite.config.ts` for publish) |
| CSS | Less + `vite-plugin-css-injected-by-js` |
| State | Zustand |
| Linting | ESLint 8 + `@typescript-eslint` (zero warnings enforced) |
| Formatting | Prettier |

---

## Key Scripts

```bash
npm run dev            # start dev server
npm run build          # tsc + vite build (demo app)
npm run build:library  # build distributable library
npm run lint           # ESLint, zero warnings
npm run publish:version # publish to npm
```

---

## Source Layout

```
src/
  FieldsKeeper/     # core library — Provider, Bucket, RootBucket, Searcher, context, types, utils
  Components/       # shared UI — ContextMenu, WarningTooltip, SuffixNode, svgElements
  Examples/         # 38+ self-contained usage examples with styles
  assets/icons/
  index.ts          # public API surface
  App.tsx           # dev/demo shell
```

---

## .ai/ Folder Convention

Planned documents and session context live in `.ai/`:

```
.ai/
  context/   # persistent feature/architecture context docs
  sessions/  # session-scoped working notes per feature or fix
```

**Always read relevant `.ai/` files before starting work on a feature or fix.** Ask the user whether to create or update an `.ai/context/` or `.ai/sessions/` doc when starting non-trivial work. Never create docs under `.ai/` without asking first.

---

## Behavioral Rules

### Git
- **Never commit or push automatically.** Always ask for explicit permission before running `git commit` or `git push`.

### Responses & Output
- **Never add a Claude Code signature** (`Co-Authored-By`, "Generated with Claude Code", or similar) anywhere — in code, commit messages, PRs, or docs.
- **Do not generate summary or markdown files unprompted.** Only create `.md` files when explicitly asked.

### Context & Research
- **Read `.ai/` first.** Before exploring the codebase from scratch, check `.ai/context/` and `.ai/sessions/` for existing context on the feature or fix in scope.
- **Ask before creating `.ai/` docs.** When starting a new feature or significant fix, ask the user whether to create or update the relevant context/session doc rather than doing it silently.
