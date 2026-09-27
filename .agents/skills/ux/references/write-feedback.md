# Write Feedback

Read when deciding whether an action asks before it acts, when a dialog that answers a write closes, how an undo is
offered, or where a failed write shows. `SKILL.md` keeps one paragraph; the mechanism is
`apps/web/content/docs/architecture/destructive-confirmation.md` and `apps/web/content/docs/architecture/dialog-shell.md`.

## The write decides, never the call site

Three kinds of write, three answers. Which kind a write is follows from its mutation, so a call site states it rather
than choosing it:

| The write                                                            | What the reader sees                                                                                           |
| :------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| The app can undo it — the recycle bin, the sheet's command history   | No confirm. It acts on click, and the undo is on screen at once: a toast's Restore, the toolbar's Undo         |
| It cannot be undone, and it is optimistic (`applyOptimistic`)        | A confirm that closes the moment it is answered (`isOptimistic`). A rejection rolls back and toasts            |
| It cannot be undone and waits for the server, or it is a create form | A confirm or form pending until the write lands. It closes on success and stays open with the draft on `false` |

- **A confirmation before a reversible act is the defect, not the caution.** It is friction the reader learns to click
  through, which is exactly what a real confirmation then needs them not to do. NN/g's rule, which
  `apps/web/content/docs/architecture/design-sources.md` cites, is a confirmation only before what cannot be undone.
  Copy saying "Undo brings it back" inside a confirm is the tell that the confirm should go.
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
