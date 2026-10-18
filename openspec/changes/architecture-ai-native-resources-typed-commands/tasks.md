## 1. Sheet commands

- [ ] 1.1 Move the sheet's column command classes to the shared layer with plain-data inputs, the browser building them as before. Verify: the existing sheet history tests pass with no change to their expectations (`pnpm test` on those files, `--run`, all passing).
- [ ] 1.2 Add the server sheet command that runs one of these inside the generic update service. Verify: a test named after the scenario 'Column rename re-keys every row', failing first, then passing; and the scenarios 'Column type change converts every cell' and 'Date format change rewrites every date'.
- [ ] 1.3 Land a command that names a row by id after rows are inserted above it, and reapply it to newer content. Verify: a test named after the scenario 'A command lands on its row after a row is inserted above it', failing first, then passing; and the scenario 'A command based on older content applies to the newer content'.

## 2. Repeating todo tick

- [ ] 2.1 Add the tick procedure on the todo list router, rolling through the shared recurring-item roll under the Resources scope. Verify: a test whose scenario is 'An agent ticks a repeating todo', failing first, then passing.
- [ ] 2.2 Refuse a follow-ups key ticking a todo the owner wrote. Verify: a test named after the scenario 'A follow-ups key cannot tick a todo the owner wrote', failing first, then passing.

## 3. Note written as Markdown

- [ ] 3.1 Add the Markdown write procedure on the note router, parsing on the server against the writing kit's own extensions, once the converter from the note Markdown portability change ships. Verify: a test named after the scenario 'A Note written from Markdown replaces its content', failing first, then passing; and the scenario 'A Note written from Markdown appends to its content'.
