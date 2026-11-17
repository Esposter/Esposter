## Why

A whiteboard element's look is set one field at a time. An owner who has styled one shape, with its outline colour, width and dash, its fill, its corners and its text size, sets each of those again on every shape that should match. The page builder already copies a node's style and pastes it onto another node, and the whiteboard's elements now hold the same kind of look, so the same pair of keys applies here.

## What Changes

- A key pair copies the look of the one selected element, its outline colour, outline width, dash pattern, sketch level, fill, corners, text size, alignments and arrowheads.
- The other key of the pair pastes the copied look onto every selected element, and each element takes only the fields its kind holds.
- The copied look is held for the session in memory and is not written to the system clipboard, so a copy of elements is not overwritten.
- A paste is one undo step, and both commands are listed in the command palette and the shortcuts dialog.

## Capabilities

### Modified Capabilities

- whiteboard (resource/whiteboard): the editor gains a copy and a paste of an element's look.

## Impact

The editor's keyboard gains two commands and a session store for the copied look. The holding rule that decides which fields a kind holds is the headless block editor's, and this change exports it so the copy reads a source by the rule a paste applies to a target. Nothing is stored, so no document changes shape and no server code changes.
