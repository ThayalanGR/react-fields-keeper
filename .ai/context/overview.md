# Project Overview

## What It Is

**react-fields-keeper** is a published React component library (npm: `react-fields-keeper`, v4.13.4) that provides a drag-and-drop bucket-based field assignment UI. Think of the "fields" panel in Excel PivotTables, Tableau, or Power BI — users drag data fields into named slots (buckets) to configure their view.

**Live demo**: https://react-fields-keeper.vercel.app/  
**npm**: https://www.npmjs.com/package/react-fields-keeper

---

## Core Concept

There are three zones:

1. **Root Bucket** (`FieldsKeeperRootBucket`) — the pool of all available/unassigned items. Acts as source.
2. **Bucket(s)** (`FieldsKeeperBucket`) — named drop targets (e.g. "Rows", "Columns", "Values"). Items are assigned here.
3. **Provider** (`FieldsKeeperProvider`) — wraps everything; holds global state via Zustand.

Users drag items from the root bucket into named buckets, or between buckets. Items can optionally be kept in multiple buckets (`allowDuplicates`). The `onUpdate` callback fires on every assignment change.

---

## Primary Use Cases

- Analytics/BI dashboard builders (field slot assignment)
- Report configurators (row/column/value selectors)
- Data pipeline builders (input/output mapping)
- Form builders (field grouping)
- Any UI where users assign items from a list into categorized slots

---

## Tech Stack

| Concern | Tool | Version |
|---|---|---|
| Framework | React + TypeScript | 18 / 5 |
| Build (dev) | Vite | 4.3.2 |
| Build (lib) | Vite + library mode | 4.3.2 |
| CSS | Less + css-injected-by-js | — |
| State | Zustand | ^4.5.0 |
| Search | fuzzy-search | ^3.2.1 |
| Highlight | mark.js | ^8.11.1 |
| Equality | lodash.isequal | ^4.5.0 |
| Context menu positioning | react-popper | 2.2.5 |
| Linting | ESLint 8 + @typescript-eslint | — |
| Formatting | Prettier | — |

**Peer deps**: `react ^18.3.1`, `react-dom ^18.3.1`

---

## Distribution

- **ESM**: `dist/index.es.js` (~173 KB)
- **UMD**: `dist/index.umd.js` (~123 KB)
- **Types**: `dist/index.d.ts`
- CSS is **inlined into JS** (no separate stylesheet to import)
- Published via GitHub Actions (`/.github/workflows/npm-publish.yml`) on version tag push

---

## Repository Layout

```
src/
  FieldsKeeper/       # Core library: Provider, Bucket, RootBucket, Searcher, context, types, utils
  Components/         # Shared UI: ContextMenu, WarningTooltip, SuffixNode, Icons
  Examples/           # 39 self-contained usage examples (Example1.tsx … Example39_*.tsx)
  assets/icons/
  index.ts            # Public API — re-exports everything consumers need
  App.tsx             # Dev/demo shell (renders examples via hash routing)
  main.tsx            # Dev entry point

dist/                 # Built output (don't edit manually)
library.vite.config.ts  # Library build config (entry: src/index.ts)
vite.config.ts          # Dev server config
CLAUDE.md               # Behavioral rules for Claude Code
```

---

## Version History (recent)

- **4.13.4** — Root label editing, expand/collapse during search, moveTo fix
- Prior versions: added context menus, folder support, highlight-across-buckets, custom renderers, nested providers
