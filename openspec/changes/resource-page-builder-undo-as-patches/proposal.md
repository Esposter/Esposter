# Undo as patches

## Why

The old editor's undo was built on a deprecated library and recorded whole snapshots, so an undo could not say what changed. Each edit can instead be written as a list of reversible operations, so undo and redo replay recorded steps, and the same operation list can be applied on the server by the agent content tools.

## What Changes

Every page builder edit is recorded as reversible operations, and undo and redo replay them.

- Each edit is applied as a list of operations, and the reverse of each operation is recorded, so undo restores the document as it was before the edit.
- Redo reapplies the last undone edit, and a new edit discards the redo entries.
- Repeated changes to one value within one interaction, such as a slider drag, form one undo entry.
- The history for an open resource is bounded, and its oldest entries drop first.
- Restoring a version clears the history.
- The command bar names the edit that Undo and Redo would reverse or reapply.
- Edits are kept in the browser, and a save still stores the whole document.
- **Capabilities:** `resource/page-builder/undo-as-patches` (new).

## Capabilities

- **resource/page-builder/undo-as-patches** (new)

## Waiting on

None.

## Impact

- The page builder's document store, which applies each edit and keeps its history.
- The shared JSON patch applier, which the agent content tools also use on the server.
- The command bar's undo and redo labels.
- The sheet's history, which takes the same primitive once both consumers share it.
- The content save, which is unchanged and still stores the whole document.
