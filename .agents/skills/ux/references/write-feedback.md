# Write Feedback

Read when deciding how an action asks before it acts, when a dialog that answers a write closes, how an undo is
offered, or where a failed write shows. `SKILL.md` keeps one paragraph; the mechanism is
`apps/web/content/docs/architecture/destructive-confirmation.md` and `apps/web/content/docs/architecture/dialog-shell.md`.

## The write decides, never the call site

Every delete confirms, the ones the app can undo included, and `restrictedDeleteSyntaxes` holds it: a `delete*`,
`remove*`, `purge*` or `revoke*` call lives only in a confirm's `:confirm`. Dismissing a toast or clearing a filter
is named `dismiss*` or `clear*`, since it deletes nothing a person made. How the confirm closes follows from the
mutation, so a call site states it rather than choosing it:

| The write                                                       | What the reader sees                                                                                           |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| Optimistic (`applyOptimistic`)                                  | A confirm that closes the moment it is answered (`isOptimistic`). A rejection rolls back and toasts            |
| Waits for the server, or a create form                          | A confirm or form pending until the write lands. It closes on success and stays open with the draft on `false` |
| Either, when the app can undo it — the bin, the sheet's history | The same confirm, then the undo on screen once it lands: a toast's Restore, the toolbar's Undo                 |

- **One rule for every delete, the undo as the second guard.** A reader cannot tell from a Delete button whether the
  app can reverse it, so a delete that did not ask is learned by losing something
  (`apps/web/content/docs/architecture/rejected/no-confirm-for-undoable-deletes.md`).
- **An optimistic write's dialog never waits for the server.** The list already changed, so a dialog held over it
  while the request is out is a lag with nothing behind it. The rollback and the error toast are the answer to a
  rejection, as they are for every optimistic write.
- **A write the reader cannot see land keeps its dialog.** A server-generated result, a room's deletion, an upload:
  the pending answer is the only sign anything is happening, and closing on failure would throw the draft away.

## The dialog owns the answer

The dialog is handed the write and closes itself through `useDialogAnswer`:
`UiConfirmDialog` and `StyledDialog` take `confirm`, `StyledFormDialog` takes `submit`, and a feature's own dialog
calls the composable. A call site never holds a pending flag, a close callback or a `withFinalizerAsync` around its
write: each one would be the caller re-deciding the timing the dialog already owns.

- Awaited is the default because it is the safe failure: a dialog that waits too long is slow, one that closes too
  early loses a draft. `isOptimistic` is the one word a call site adds, and only over a write with `applyOptimistic`.
- The write is called before the close, so a singleton dialog's handler reads its target before closing clears it.
  Writing the handler to read the target after an `await` breaks that, and so does closing first.
- `false` is the one value that keeps an awaited dialog open, so a store function that already reports success
  returns it straight through (`deleteRoom`, `saveItem`). A function that reports nothing closes the dialog when it
  settles, which is what its toast already tells the reader.

## An undo is offered where it can be trusted

- **A toast's undo is single-use** (`AppNotificationAction.isSingleUse`), spent once it lands, because a second fire
  targets state the first already changed. The resource delete's Restore is the reference, from the list and the
  resource page alike, and after a bulk delete one click brings back the whole selection, because an undo that
  asks for one click per item is not an undo.
- **A stack-based undo gets no toast.** The sheet's history undoes the latest command, so an Undo fired from a toast
  after a later edit would reverse that edit instead. The toolbar's Undo and its shortcut are the way back.
