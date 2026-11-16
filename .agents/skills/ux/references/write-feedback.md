# Write Feedback

Read when deciding how an action asks before it acts, when a dialog that answers a write closes, how an undo is
offered, or where a failed write shows. `SKILL.md` keeps one paragraph; the mechanism is
`openspec/specs/architecture/destructive-confirmation/design.md` and `openspec/specs/architecture/dialog-shell/design.md`.

## The write decides, never the call site

Every delete confirms, the ones the app can undo included (`restrictedDeleteSyntaxes`). An act that deletes nothing a
person made — dismissing a toast, clearing a filter — is named `dismiss*` or `clear*` rather than excused from the
rule. How the confirm closes follows from the mutation, so a call site states it rather than choosing it:

| The write                                                       | What the reader sees                                                                                           |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| Optimistic (`applyOptimistic`), the default                     | A confirm or form that closes the moment it is answered. A rejection rolls back and toasts                     |
| Waits for a reason (`awaited-because`)                          | A confirm or form pending until the write lands. It closes on success and stays open with the draft on `false` |
| Either, when the app can undo it — the bin, the sheet's history | The same confirm, then the undo on screen once it lands: a toast's Restore, the toolbar's Undo                 |

- **One rule for every delete, the undo as the second guard**, since a reader cannot tell from a Delete button whether
  the app can reverse it (`openspec/rejected/architecture/no-confirm-for-undoable-deletes/design.md`).
- **An optimistic write's dialog never waits for the server.** The list already changed, so a dialog held over it
  while the request is out is a lag with nothing behind it. The rollback and the error toast are the answer to a
  rejection, as they are for every optimistic write.
- **A write that waits for one of the three reasons keeps its dialog.** A value only the server mints (an invite
  link, an API key's secret, a presigned upload), an outcome the server decides (moderation, a deploy), or a step
  that cannot be undone (the sign-out after an account delete): the pending answer is the only sign anything is
  happening, and closing on failure would throw the draft away. The reasons are `AwaitedReason`, and the client
  data design's table is their owner.

## The dialog owns the answer

The dialog is handed the write and closes itself through `useDialogAnswer`:
`UiConfirmDialog` and `StyledDialog` take `confirm`, `StyledFormDialog` takes `submit`, and a feature's own dialog
calls the composable. A call site never holds a pending flag, a close callback or a `withFinalizerAsync` around its
write: each one would be the caller re-deciding the timing the dialog already owns.

- Optimistic is the default, so a new dialog cannot wait by accident. `awaited-because` is the one prop a call site
  adds, naming its reason, and only over a write that itself waits for that reason.
- The write is called before the close, so a singleton dialog's handler reads its target before closing clears it.
  Writing the handler to read the target after an `await` breaks that, and so does closing first.
- `false` is the one value that keeps an awaited dialog open, so a store function behind one reports whether the
  server kept the write and returns it straight through (`createRoomEmoji`, `createDirectMessage`, the admin
  action). An optimistic store function returns nothing, and its dialog has already closed.

## An undo is offered where it can be trusted

- **A toast's undo is single-use** (`AppNotificationAction.isSingleUse`), spent once it lands, because a second fire
  targets state the first already changed. The resource delete's Restore is the reference, from the list and the
  resource page alike, and after a bulk delete one click brings back the whole selection, because an undo that
  asks for one click per item is not an undo.
- **A stack-based undo gets no toast.** The sheet's history undoes the latest command, so an Undo fired from a toast
  after a later edit would reverse that edit instead. The toolbar's Undo and its shortcut are the way back.
