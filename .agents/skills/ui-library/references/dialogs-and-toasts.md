# Dialogs and Toasts

Read when a write asks before it acts, a dialog answers a write, a modal opens something of its own, or a surface shows a toast. That all three are the library's is in `SKILL.md`; this page is how each is used. Whether an act confirms at all is the `ux` skill's (`references/write-feedback.md`).

- **A delete's confirmation is a `UiConfirmDialog`**, the ones the app can undo included (`ux` skill, `references/write-feedback.md`). A dialog that answers a write takes the write as a function — `confirm` on `UiConfirmDialog` and `StyledDialog`, `submit` on `StyledFormDialog` — and closes itself through `useDialogAnswer`: at once with `isOptimistic`, otherwise once it settles, staying open on `false`. A dialog of a feature's own answers through the same composable, never a pending flag and a close callback of its own.
- **A modal is `UiDialog`**, or a dialog shell on it. It is in the top layer, so what its content opens is the library's: a menu, select or tooltip that portals itself to the body opens underneath and inert. Its body mounts under `v-if` on the open model (`apps/web/content/docs/architecture/dialog-shell.md`); the shells do this for their consumers.
- **A toast goes through the app's one stack** (`AppToastStack`), as a `UiToast` fed by the store that owns that kind of toast — never a snackbar of its own.
