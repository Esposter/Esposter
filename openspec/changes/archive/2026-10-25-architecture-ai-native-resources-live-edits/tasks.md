## 1. One subscription for every type

- [x] 1.1 Run one save subscription for the open resource, whatever its type, and stream the new version and the writing device rather than the content. Verify: a test named after the scenario 'An open resource of any type hears another device's save', failing first, then passing; and the scenario 'A device does not hear its own save'.

## 2. Adoption

- [x] 2.1 Adopt another device's save in an editor with no unsaved edit, running the reload and adopt stages in order, and clear undo history and the delta baseline. Verify: a test named after the scenario 'An editor with nothing unsaved adopts a save in place', failing first, then passing; and the scenario 'Adopting a save clears undo history and the delta baseline'.
- [x] 2.2 Re-read the todo list on another device's save in place of taking the streamed list. Verify: a test named after the scenario 'An open todo list re-reads another device's save', failing first, then passing.

## 3. Unsaved edits

- [x] 3.1 Hold the unsaved edit and show a notice naming the device, with autosave held. Verify: a test named after the scenario 'An unsaved edit stays on screen when another device saves', failing first, then passing.
- [x] 3.2 Answer the notice with take theirs or keep mine. Verify: a test named after the scenario 'Taking theirs replaces the unsaved edit', failing first, then passing; and the scenario 'Keeping mine saves over the other version and keeps it in history'.
- [x] 3.3 Name an agent in the notice by its key's name. Verify: a test named after the scenario 'A save made with a key is named by that key', failing first, then passing.

## Built so far

- Every task above is ticked, each with its own test or proof. 1.1 streams the version, device and key name; the explorer runs one save subscription for any type, and the own-device and keyed-save scenarios are server tests. 2.1 adopts in place and clears the delta baseline. 2.2 re-reads the todo list through the same reload. 3.1 holds the save behind an unwritten edit and notices it. 3.2 answers it: take theirs drops the edit, keep mine runs the `Keep` stage. 3.3 names an agent by its key.
- The keep-mine decision the tasks left open is made in the design: a `Keep` stage on `ResourceContentHookMap`, run by each content store.

## Owed

- A look at the notice in the explorer, in a browser, by the owner. The tests cover the store's answers, not the notice's rendering or its two buttons.

## Decided

- **Device naming: "another device" is the final wording.** A save carries a `Device` with a session and user id and no name, so the notice cannot name the device more usefully. An agent's save is named by its key instead. A device name would need its own change, which is not planned.
- **Stale-save choice: the refresh stays for a refused save.** The choice is offered when another device's save lands over an unsaved edit, at once, under the live-edits capability. A refused save names no save, so it keeps the refresh. The decision and its reason are written in the `resource-page-parity` delta and in the design.

## Typecheck

- The client work was checked by the suites that exercise it (store, todo list, server procedures), not by a full `typecheck` run; CI's typecheck is the owner of that.
