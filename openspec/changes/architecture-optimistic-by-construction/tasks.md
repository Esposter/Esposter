# Tasks

Each phase leaves the app building and its touched suites green. The compiler finds every caller of a changed primitive, so a phase is done when nothing it changed is still called the old way.

## 1. The write primitive

- [ ] 1.1 Add `AwaitedReason` (`ServerIssuedValue`, `ServerDecidedOutcome`, `IrreversibleStep`) and overload `executeMutation`: `void` with `applyOptimistic` and an optional `reconcile`, an outcome with `awaitedBecause` and `onSuccess`, and options naming neither failing to compile. Verify: a type test that an optimistic write gives its caller nothing to await and that options naming neither form are refused, and a test that `reconcile` receives the server's result once the write lands.
- [ ] 1.2 Convert every `executeMutation` caller the compiler names. A caller with an optimistic apply loses its `await` and moves every screen step it sequenced after the answer to before the write. A caller without one either gains an optimistic apply or names its reason. Verify: tests named after the scenarios 'An edited comment leaves edit mode while its save is in flight' and 'A refused write puts the screen back' in `useSaveRichTextEdit`'s suite, and the touched suites green.

## 2. Dialogs

- [ ] 2.1 `useDialogAnswer` answers optimistically unless given a reason. `UiConfirmDialog`, `StyledDialog`, `StyledFormDialog` and `StyledEditFormDialog` take `awaitedBecause` in place of `isOptimistic`, every `is-optimistic` is deleted, and a dialog that must wait names its reason. Verify: tests named after the scenarios 'A confirmed dialog closes while its write is in flight', 'A refused answer keeps the draft', 'An optimistic delete closes as soon as it is confirmed', 'A rejected optimistic delete restores the list and shows an error', 'The dialog stays locked while the delete is pending' and 'A refused or failed delete leaves the dialog open to try again', in the dialog shell's and the confirm dialog's suites.

## 3. Content stores

- [ ] 3.1 `createContentData`'s `saveContent(rollback)` returns nothing, and the todo, sheet, note, blueprint, survey and every other content store pass the closure that undoes their change. The blueprint adopts its manifest and the survey writes its content at once. Verify: tests named after the scenarios 'A ticked todo moves under Completed while its save is in flight' in the todo items suite and 'A stale version rolls the save back and prompts a refresh' in the resource store's suite.

## 4. Creates under the client's id

- [ ] 4.1 Every create whose row is drawn in a list takes a `uuidv7()` id from the client, and its procedure accepts the id under the row's id schema. `createMessage`'s and `createRoomCategory`'s placeholder swaps are deleted, and a comment, a role, a room, an API key's listing row and a data export row are drawn at once from what the client holds. Verify: a test named after the scenario 'A sent message keeps its place when the server confirms it' in the message data store's suite, and each create's router test accepting the client's id.
- [ ] 4.2 The remaining waits each name their reason: an invite, a webhook token, a regenerated link, a join by code, a direct message resolved against existing rooms, an email compile, moderation, call admission, a blueprint deploy, the account delete's sign-out and the game lease's reload. Verify: a test named after the scenario 'A create whose link only the server mints waits for the server' in the invite dialog's suite. The like's scenario is owned by 4.3, since no reason here covers the like.

- [ ] 4.3 A like's create keeps single-flight, and no `AwaitedReason` covers it. The like is optimistic under the closed set, so a rapid second click would fire a second `createLike` into the likes primary key, against the scenario 'A rapid second click on a like creates only one like' that this change keeps. Decide between a fourth reason for a create that must not repeat, a UI-level single-flight guard on the like button, and dropping the scenario, then record the choice in `design.md`'s reason table. Verify: the scenario's test in the like operations' suite passes under the chosen form.

## 5. The standard

- [ ] 5.1 Rewrite the client data, dialog shell and destructive confirmation designs as built, archive this change, and sweep the skills that teach the old forms (`is-optimistic`, `onSuccess` closing a dialog, a placeholder swap). Verify: no `is-optimistic`, `isOptimistic` or placeholder swap left in `apps/web/app`, and the `openspec` workspace tests green.
