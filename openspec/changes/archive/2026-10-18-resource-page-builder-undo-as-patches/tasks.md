## 1. Recording

- [x] 1.1 Apply each command's operations to the open resource's document through the page builder store, pushing the core's history entry with its label. Verify: a test named after the scenario 'Undo restores the document before the last edit'.
- [x] 1.2 Give each slider drag, held key and text session one interaction id, and merge an edit that only replaces the newest entry's paths within the same interaction into that entry, keeping its first inverses. Verify: a test named after the scenario 'A drag of a value is one undo entry'.

## 2. History

- [x] 2.1 Keep one bounded history per open resource, with the labels the command bar shows. Verify: tests named after the scenarios 'Undo stops at the oldest kept entry' and 'The command bar names the edit it would undo'.
- [x] 2.2 Reapply the last undone edit on Redo, and discard the redo entries on a new edit. Verify: tests named after the scenarios 'Redo reapplies an undone edit' and 'A new edit after undo discards the redo entry'.
- [x] 2.3 Clear a resource's history when the store reloads its document, the function the cutover registers on the content store's reload hook. Verify: a test named after the scenario 'Reloading a document leaves nothing to undo'.

## 3. Shared primitive

- [x] 3.1 Move the core's bounded history into `@esposter/shared`, and build the core's history and the sheet's history store on it. Verify: the sheet's existing history tests pass unchanged, and the core's history tests pass from the shared package.

## 4. Saving

- [x] 4.1 Keep the patches in the browser and send the whole document on each save. Verify: a test named after the scenario 'A save stores the whole document after edits'.

## 5. The record

- [x] 5.1 Describe the history store and the shared bounded history as built, then archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/services/openspec` passes.
