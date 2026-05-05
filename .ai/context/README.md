# .ai/

AI context layer for react-fields-keeper. Read the relevant folder before starting any non-trivial work.

```
.ai/
  context/    # Deep domain knowledge. Stable. Changes rarely.
  commands/   # Task-specific instructions. How to do X in this codebase.
  sessions/   # Living log. Append an entry after each non-trivial session.
```

---

## context/

Deep domain knowledge about the codebase. Read before touching any non-trivial area.

| File | Contents |
|---|---|
| [overview.md](overview.md) | What the project is, use cases, tech stack, npm distribution, repo layout |
| [architecture.md](architecture.md) | Component hierarchy, Zustand state model, data flow, drag & drop, grouping, CSS |
| [api-reference.md](api-reference.md) | All public props, TypeScript interfaces, exported functions, examples index |
| [development.md](development.md) | Scripts, build pipeline, code conventions, CI/CD, common gotchas |
| [accessibility.md](accessibility.md) | ARIA patterns in use, keyboard interaction model, known gaps |

**Reading order:**
- Bug fix or feature → overview → architecture → api-reference
- Build / release → overview → development
- API addition → architecture → api-reference → development
- Accessibility work → accessibility → architecture

---

## commands/

Runbooks for known workflows. Check here before figuring out a process from scratch.

| File | When to use |
|---|---|
| [new-example.md](../commands/new-example.md) | Adding a new example to the demo app |
| [extend-api.md](../commands/extend-api.md) | Adding a new prop to an existing component |
| [release.md](../commands/release.md) | Bumping version and publishing to npm |
| [a11y.md](../commands/a11y.md) | Adding accessibility to new or existing components |

---

## sessions/

One file per feature, named `YYYY-MM-DD-{feature}.md`. Kept until the feature is merged and deployed, then deleted after 2 patch releases.

| File | Feature | Status |
|---|---|---|
| [2026-05-05-accessibility.md](../sessions/2026-05-05-accessibility.md) | Accessibility support | in-progress |
