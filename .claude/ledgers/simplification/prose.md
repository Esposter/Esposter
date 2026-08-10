# Prose

| Unit                        | Swept      | Notes                                                                                                       |
| --------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `packages/app/content/docs` | 2026-08-10 | Ten pages named code that had moved; tombstone-inversion rule → `docs`. Diagram quality surveyed, not swept |
| `.claude/skills`            | —          | against the ownership map in README                                                                         |

## Open findings

- `docs/index.md` carries the tree's only MDC syntax (`{target="_blank"}`) against the plain-GFM mandate. Removing it changes link behaviour.
- `platform/resource-consolidation.md` is a shipped one-time-change record, which the `docs` skill says never becomes a page. Deleting it needs coordinated edits to `platform/index.md`, `platform/roadmap.md` and `DocsSectionGroupsMap.ts`, and one durable fact in it — content class names frozen by `JSONClassMap` — should move to `architecture/serialization.md` first.
- Docs name components inconsistently: a file path (`Resource/Blade/Actions.vue`) in some pages, the auto-import name (`BladeActions`) in others. Both resolve; no rule says which.
- Twenty-seven area pages carry no Mermaid block. Most are legitimately exempt (rule pages, static inventories), so the diagram mandate needs a stated exemption rather than a sweep.
