# Shared

| Unit                                          | Swept      | Notes                                                                                                                   |
| --------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| optimistic rollbacks                          | 2026-08-09 | `applyOptimistic` sites + hand-rolled ones; two bugs → `pinia` skill                                                    |
| `app/components/Styled`                       | 2026-08-10 | `StyledNavList` extracted (pinned by its own test); effect-scope rule → `vue-composable-patterns`                       |
| `shared/models/db` + `shared/models/resource` | 2026-08-10 | Two over-permissive schemas tightened and pinned; the composite key and the normalized-string helpers each own one home |
| rest of `shared/models` + `shared/services`   | —          |                                                                                                                         |
| `packages/shared`, `packages/shared-node`     | —          |                                                                                                                         |

## Open findings

- `StyledDialog` cannot express an action-less dialog (`confirmButtonProps` is required and the actions row
  always renders, so `SearchDialog` and `KeyboardShortcutsDialog` re-roll the shell), and it picks its confirm
  button by sniffing `confirmButtonProps.color`, so `color: 'primary'` silently loses the `StyledButton`
  gradient. One contract decision: an intent-driven `confirmAction` that retires `hideCancelButton` and lets
  both dialogs compose the shell (~27 mechanical call sites, 4 carrying a colour today), or the one-line gate
  fix `!color || color === "primary"` that repairs only the gradient. `Forward/RoomDialog`'s pinned-header
  need (`messaging.md`) wants the same contract opened.
- `Styled/DataTable/{Index,Server}.vue` are byte-identical apart from the table component, including both
  `:deep()` rules. Decision: hoist the rules into `globals.scss` (recommended — needs the store's
  `background-opacity-40` rewritten as `rgba(...)`, since Vuetify drops a theme colour's alpha channel, and
  settles whether the hand-picked row-hover tint becomes `bg-hover`), or a third `Shell.vue` taking `is`,
  which degrades per-table prop typing to a union.
- `Clipboard/{Button,IconButton}` each pay a `usePermission` pair and `IconButton` mounts its own snackbar per
  row. The fix is the singleton-dialog pattern — a `useClipboardStore` plus one layout-level snackbar — which
  needs a mount point outside this unit.
