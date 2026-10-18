## 1. One subscription for every type

- [ ] 1.1 Run one save subscription for the open resource, whatever its type, and stream the new version and the writing device rather than the content. Verify: a test named after the scenario 'An open resource of any type hears another device's save', failing first, then passing; and the scenario 'A device does not hear its own save'.

## 2. Adoption

- [ ] 2.1 Adopt another device's save in an editor with no unsaved edit, running the reload and adopt stages in order, and clear undo history and the delta baseline. Verify: a test named after the scenario 'An editor with nothing unsaved adopts a save in place', failing first, then passing; and the scenario 'Adopting a save clears undo history and the delta baseline'.
- [ ] 2.2 Re-read the todo list on another device's save in place of taking the streamed list. Verify: a test named after the scenario 'An open todo list re-reads another device's save', failing first, then passing.

## 3. Unsaved edits

- [ ] 3.1 Hold the unsaved edit and show a notice naming the device, with autosave held. Verify: a test named after the scenario 'An unsaved edit stays on screen when another device saves', failing first, then passing.
- [ ] 3.2 Answer the notice with take theirs or keep mine. Verify: a test named after the scenario 'Taking theirs replaces the unsaved edit', failing first, then passing; and the scenario 'Keeping mine saves over the other version and keeps it in history'.
- [ ] 3.3 Name an agent in the notice by its key's name. Verify: a test named after the scenario 'A save made with a key is named by that key', failing first, then passing.
