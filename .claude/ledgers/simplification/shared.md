# Shared

| Unit                                          | Swept      | Notes                                                                                                                   |
| --------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| optimistic rollbacks                          | 2026-08-09 | `applyOptimistic` sites + hand-rolled ones; two bugs → `pinia` skill                                                    |
| `app/components/Styled`                       | 2026-08-10 | `StyledNavList` extracted (pinned by its own test); effect-scope rule → `vue-composable-patterns`                       |
| `shared/models/db` + `shared/models/resource` | 2026-08-10 | Two over-permissive schemas tightened and pinned; the composite key and the normalized-string helpers each own one home |
| rest of `shared/models` + `shared/services`   | —          |                                                                                                                         |
| `packages/shared`, `packages/shared-node`     | —          |                                                                                                                         |

## Open findings

Behaviour-changing, raised out of `app/components/Styled` (2026-08-10):

- `StyledDialog` cannot express an action-less dialog — `confirmButtonProps` is required and the actions row always renders, so `SearchDialog` and `KeyboardShortcutsDialog` re-roll the shell. `hideCancelButton` is the one-off flag that half-answers it. Generalise to an intent-driven actions contract and compose all three on the shell.
- `StyledDialog` picks its confirm button by sniffing `confirmButtonProps.color`, so a caller asking for `color: 'primary'` silently loses the `StyledButton` gradient. Needs an explicit intent → component map.
- `StyledEditFormDialogConfirmCloseDialogButton` routes its message through `cardProps.text` inside a bare `v-dialog`, against the dialog standard.
- `StyledEditFormDialogConfirmDeleteDialogButton` is a twin of `StyledConfirmDeleteDialogButton`; collapsing them needs an activator-props passthrough on the shared one.
- `StyledSkeleton`'s `b-1` has no `b-solid`, so the bordered skeleton renders borderless in every call site.
- `StyledEmptyState` uses `text-h6`, an MD2 name UnoCSS does not generate here, so the title renders at body size; `size="64"` is px on a shared primitive.
- `StyledPreviewCard` hand-rolls a card look beside `StyledCard`; `StyledErrorState`'s Retry is a raw tonal `v-btn`; `StyledSearchDialog` uses a bare `v-card`.
- `StyledConfirmDeleteDialogButton` smuggles a `class: 'm-0'` margin reset through `buttonProps`; `StyledEditFormDialog` dividers are `thickness="2"` where every other dialog takes the theme default.
- `Styled/DataTable/{Index,Server}.vue` are byte-identical apart from the table component, including both `:deep()` rules; deduping needs a shell whose wrapper element changes the DOM.
- `StyledWaypoint` keeps an IntersectionObserver alive for the component's whole life; pausing it on `isActive` changes when the visibility watch fires.
- `Clipboard/{Button,IconButton}` each pay a `usePermission` pair and mount their own snackbar per row; the fix is a clipboard store, outside this unit.
- `StyledToggleFullScreenDialogButton` should be a `v-model`, but one call site (`Resource/Sheet/Dialog.vue`) is outside this unit.
