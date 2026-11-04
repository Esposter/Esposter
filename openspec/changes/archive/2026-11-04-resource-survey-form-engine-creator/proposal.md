# Survey Creator

Part of the [survey form engine program](../2026-11-04-resource-survey-form-engine-program/design.md).

## Why

The owner authors a survey in SurveyJS's Creator, a vendor product with its own toolbox, designer, undo and tabs. The replacement is the owner's editor on the typed document: the same page-builder shape the webpage and email editors already have, drawn with the UI library, with every pointer act also a keyboard command.

## What Changes

- An editor shell with a layers tree, a palette of question kinds, a canvas that draws the survey, a properties panel and a toolbar.
- Every edit is a JSON Patch with its inverse, applied through the core and recorded in a bounded history, so undo and redo are patch lists.
- Add, move, move out, move into the previous sibling, move to another place, duplicate and remove, each a command with a shortcut, and reorder by dragging in the layers tree with the same command on the keyboard.
- Import, export and clear over the typed document, and a preview that is the runner itself.

## Capabilities

- **resource/survey-creator** (new): a question is added from the palette, moved by keyboard, undone, and a document that fails the check is refused on import with the path of the fault.
