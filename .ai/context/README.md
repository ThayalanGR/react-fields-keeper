# .ai/

AI-assisted development context for react-fields-keeper.

## Folder structure

```
.ai/
  context/    # Stable, codebase-wide docs — read before starting any non-trivial work
  feats/      # Feature-scoped docs — spec, decisions, open questions; archived or deleted after shipping
  sessions/   # Ephemeral session notes — what was done today; deleted after the feature lands
```

---

## context/

Persistent context documents. Read these before starting any non-trivial work.

| File | Contents |
|---|---|
| [overview.md](overview.md) | What the project is, use cases, tech stack, npm distribution, repo layout |
| [architecture.md](architecture.md) | Component hierarchy, Zustand state model, data flow, drag & drop, grouping, CSS |
| [api-reference.md](api-reference.md) | All public props, TypeScript interfaces, exported functions, examples index |
| [development.md](development.md) | Scripts, build pipeline, code conventions, CI/CD, common gotchas |

### Reading order for new work

- **Bug fix or feature**: overview → architecture → api-reference
- **Build/release task**: overview → development
- **API addition**: architecture → api-reference → development (conventions)

---

## feats/

One file per in-progress or recently shipped feature. Contains: motivation, scope, phase breakdown, key decisions, known gaps.

After a feature ships — promote any non-obvious decisions or constraints into `context/`, then delete the feat doc.

| File | Feature |
|---|---|
| [accessibility.md](../feats/accessibility.md) | ARIA labels, keyboard navigation, focus restoration |

---

## sessions/

One file per working session, named `YYYY-MM-DD-<topic>.md`. Contains: what was discussed, what was implemented, what's pending.

Delete after the feature lands.
