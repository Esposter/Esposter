# Shared

| Unit                                          | Swept      | Notes                                                                                                                                                                                                                                  |
| --------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| optimistic rollbacks                          | 2026-08-09 | `applyOptimistic` sites + hand-rolled ones; two bugs → `pinia` skill                                                                                                                                                                   |
| `app/components/Styled`                       | 2026-08-11 | `StyledNavList` extracted; `StyledDialog` grew an action-less form and a pinned `#header`, both pinned by its own new test; both `StyledDataTable` wrappers deleted into `globals.scss`; effect-scope rule → `vue-composable-patterns` |
| `shared/models/db` + `shared/models/resource` | 2026-08-10 | Two over-permissive schemas tightened and pinned; the composite key and the normalized-string helpers each own one home                                                                                                                |
| rest of `shared/models` + `shared/services`   | —          |                                                                                                                                                                                                                                        |
| `packages/shared`, `packages/shared-node`     | —          |                                                                                                                                                                                                                                        |

## Open findings

- `Clipboard/{Button,IconButton}` each pay a `usePermission` pair and `IconButton` mounts its own snackbar per
  row. The fix is the singleton-dialog pattern — a `useClipboardStore` plus one layout-level snackbar — which
  needs a mount point outside this unit.
