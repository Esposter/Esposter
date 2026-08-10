# Prose

| Unit                        | Swept      | Notes                                                                                                       |
| --------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `packages/app/content/docs` | 2026-08-10 | Ten pages named code that had moved; tombstone-inversion rule → `docs`. Diagram quality surveyed, not swept |
| `.claude/skills`            | —          | against the ownership map in README                                                                         |

## Open findings

- Docs name components inconsistently: a file path (`Resource/Blade/Actions.vue`) in some pages, the auto-import name (`BladeActions`) in others. The convention is now stated in the `docs` skill (the auto-import name in prose, paths only in Key Files), but 32 mentions across ~12 pages still need rewriting, several in pages under active edit. Decision: its own one-shot ledger row rather than folding it into a contended pass.
- Three pages are genuinely short a diagram rather than exempt: `esbabbler/calls/screenshare.md`, `platform/sheet-resource.md`, `posts/posts-and-comments.md`.
