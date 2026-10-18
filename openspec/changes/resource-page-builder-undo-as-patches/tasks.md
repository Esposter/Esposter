## 1. Recording

- [ ] 1.1 Apply each edit as its list of operations, recording the reverse of each operation. Verify: a test named after the scenario 'Undo restores the document before the last edit'.
- [ ] 1.2 Coalesce repeated changes to one value within an interaction, keeping the first reverse and the last value. Verify: a test named after the scenario 'A drag of a value is one undo entry'.

## 2. History

- [ ] 2.1 Keep the history and the redo entries per open resource, bounded, with the labels the command bar shows. Verify: tests named after the scenarios 'Undo stops at the oldest kept entry' and 'The command bar names the edit it would undo'.
- [ ] 2.2 Reapply the last undone edit on Redo, and discard the redo entries on a new edit. Verify: tests named after the scenarios 'Redo reapplies an undone edit' and 'A new edit after undo discards the redo entry'.
- [ ] 2.3 Clear the history when a version is restored. Verify: a test named after the scenario 'Restoring a version leaves nothing to undo'.

## 3. Shared primitive

- [ ] 3.1 Collapse the sheet's history and this history onto one shared primitive, now that both consumers exist. Verify: the sheet's existing history tests pass unchanged, and a test named after the scenario 'Undo restores the document before the last edit' passes for the page builder.

## 4. Saving

- [ ] 4.1 Keep edits in the browser and save the whole document as it is today. Verify: a test whose scenario is 'A save stores the whole document after edits'.
