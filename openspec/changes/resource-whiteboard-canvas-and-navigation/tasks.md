# Tasks

## 1. A plain canvas

- [ ] 1.1 Remove the dot grid from the canvas, the snap toggle from the toolbar, and the snap state from the editor store. Verify: tests named after the scenarios 'The canvas draws no grid' and 'A moved shape lands where the pointer puts it' written first and seen failing.
- [ ] 1.2 Remove the grid rounding from the move, resize and placement reducers and delete the headless snap function and the grid size constant. Verify: the typecheck and the reducers' existing tests, with the snap cases deleted.

## 2. Navigation

- [ ] 2.1 Pan on the wheel and zoom about the pointer on Ctrl or Cmd with the wheel and on a pinch, clamped between 0.1 and 30. Verify: tests named after the scenarios 'The wheel pans', 'Ctrl and the wheel zoom about the pointer' and 'Zoom stops at the limits' written first and seen failing.
- [ ] 2.2 Pan with Space held and a drag. Verify: a test named after the scenario 'Space and a drag pan' written first and seen failing.
- [ ] 2.3 Reset the zoom, fit the content and fit the selection from the keyboard. Verify: tests named after the scenarios 'Shift and 1 fit the content' and 'Fitting an empty board changes nothing' written first and seen failing.

## 3. Selection and clipboard

- [ ] 3.1 Select every element on Ctrl or Cmd with A, leaving text editing alone. Verify: tests named after the scenarios 'Select all selects every element' and 'Select all while editing text selects the text' written first and seen failing.
- [ ] 3.2 Copy and cut the selection to the clipboard as marked JSON. Verify: a test named after the scenario 'Cut and its paste undo separately' written first and seen failing.
- [ ] 3.3 Paste marked clipboard text as offset copies with fresh ids and rebound arrows, and ignore text without the marker. Verify: tests named after the scenarios 'Paste adds offset copies with fresh ids', 'A pasted arrow is bound to the pasted shapes', 'An arrow pasted without its shapes has free ends' and 'Clipboard text without the marker is ignored' written first and seen failing.

## 4. The record

- [ ] 4.1 Update the whiteboard design's grid, snap and viewport prose and diagrams, and name the old direction as rejected in its Settled list. Verify: `pnpm exec openspec validate resource-whiteboard-canvas-and-navigation --strict --no-interactive` passes.
