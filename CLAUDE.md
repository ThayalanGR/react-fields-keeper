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

```
.ai/
  context/    # Deep domain knowledge. Stable. Changes rarely.
  commands/   # Task-specific instructions. How to do X in this codebase.
  sessions/   # Living log. Append an entry after each non-trivial session.
```

**Always read relevant `.ai/` files before starting work.**
- Check `context/` for domain knowledge on the area being touched.
- Check `commands/` for a runbook if the task is a known workflow (e.g. release, new example, extend API).
- Check `sessions/log.md` for recent decisions and in-progress work.

**After non-trivial sessions**, ask the user whether to create or update a session file under `sessions/`. Never write to `.ai/` without asking first.

Session file lifecycle:
- Named `YYYY-MM-DD-{feature}.md`
- Kept until the feature is merged and deployed
- Deleted after 2 patch releases post-deployment

---

## Behavioral Rules

### Git
- **Never commit or push automatically.** Always ask for explicit permission before running `git commit` or `git push`.

### Responses & Output
- **Never add a Claude Code signature** (`Co-Authored-By`, "Generated with Claude Code", or similar) anywhere — in code, commit messages, PRs, or docs.
- **Do not generate summary or markdown files unprompted.** Only create `.md` files when explicitly asked.

### Features
- **Every new feature must ship with an example.** When adding a new prop, behaviour, or component, add a self-contained example under `src/Examples/` demonstrating it. Follow `.ai/commands/new-example.md` for the steps. No feature is complete without a working example.

### Context & Research
- **Read `.ai/` first.** Before exploring the codebase from scratch, check `context/`, `commands/`, and any open session files under `sessions/` for existing context on the area in scope.
- **Ask before writing `.ai/` docs.** After non-trivial sessions, ask the user whether to append to `sessions/log.md`. Never create or modify `.ai/` files without asking first.
