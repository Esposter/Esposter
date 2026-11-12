# Tasks

## 1. The menu

- [x] 1.1 Build the two item lists from the keyboard's commands, the selection's and the board's, listing stacking for one element and edit text where there is text. Verify: tests named after the scenarios 'Stacking is listed for one element only', 'Duplicate in the menu copies the selection', 'Delete in the menu asks first', 'Edit text opens the editor over the element', 'Select all in the menu selects every element', 'Paste in the menu adds the clipboard's elements' and 'A refused clipboard read says so' written first and seen failing.
- [x] 1.2 Open the shared context menu at the pointer from the canvas, settling the selection before the items are built. Verify: tests named after the scenarios 'A right-click on an unselected element selects it and opens its menu', 'A right-click on a selected element keeps the selection' and 'A right-click on empty canvas clears the selection and opens the board's menu' written first and seen failing.

## 2. The record

- [x] 2.1 Update the whiteboard design's keyboard and features prose for the menu. Verify: `pnpm exec openspec validate resource-whiteboard-context-menu --strict --no-interactive` passes.
