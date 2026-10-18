## 1. Frame

- [x] 1.1 Give the app a browser suite on the shared browser configuration, in a configuration apart from the default run, with its own script. Verify: the suite's script runs a first browser test, and `pnpm test <a unit test path> --run` from `apps/web` starts no browser.
- [ ] 1.2 Draw the page in an isolated frame at tablet and mobile width, and at desktop width no narrower than 992 pixels, scaling a narrow pane down, with the widths and breakpoints named once. Verify: tests named after the scenarios 'Switching to tablet draws the page at tablet width' and 'A narrow pane scales the desktop canvas down'.
- [ ] 1.3 Keep the page's styles out of the editor and the editor's styles out of the page, and stop custom HTML scripts from running in the canvas, in the browser suite. Record there whether the frame takes the sandbox. Verify: tests named after the scenarios 'A page's body style does not restyle the editor' and 'A script inside a custom HTML block does not run in the canvas'.

## 2. Selection and overlays

- [ ] 2.1 Draw the hover outline, the selection outline and the node toolbar over the frame. Verify: a test named after the scenario 'Hovering a node outlines it and clicking selects it'.

## 3. Pointer

- [ ] 3.1 Drag a palette block into the slot under the pointer, cancelling where none accepts it, and let Escape cancel a drag. Verify: tests named after the scenarios 'Dragging a block into a column inserts it there', 'Dropping a block where no slot accepts it cancels the drop' and 'Escape cancels a drag'.

## 4. Keyboard moves

- [x] 4.1 Add to the headless core the previous and next node in document order, the slots in a document that accept a node, a move out after the parent, the layers rows and duplicate, each a pure function with its package test in the plain Node environment. Verify: a test named after the scenario 'Duplicating a node places its copy after it', and a package test per function.
- [ ] 4.2 Add the Alt-arrow moves with their announcement, keeping focus on the node. Verify: tests named after the scenarios 'Alt Down moves the selected node after its next sibling', 'Alt Right moves a node into the previous sibling' and 'Alt Left moves a node out after its parent'.
- [ ] 4.3 Add Move to, listing only the slots that accept the node by path. Verify: tests named after the scenarios 'Move to lists every slot that accepts the node' and 'Move to offers no slot that refuses the node'.
- [ ] 4.4 Move selection and focus to a neighbour when a node is deleted. Verify: a test named after the scenario 'Deleting a node moves focus to a neighbour'.

## 5. Layers and text

- [ ] 5.1 Build the layers tree on the shared UI library's tree component, with arrows, Home, End and type-ahead. Verify: tests named after the scenarios 'Arrow keys walk the layers tree and select the focused node' and 'Typing a label in the tree moves focus to that node'.
- [ ] 5.2 Mount the text editor on the selected text node on Enter, and return focus to the tree on Escape. Verify: tests named after the scenarios 'Enter edits a text node in place' and 'Escape leaves a text node being edited'.

## 6. Clipboard

- [ ] 6.1 Paste a copied node into another webpage as a separate copy, and refuse a webpage node pasted into an email. Verify: tests named after the scenarios 'A node pasted into another webpage appears as a copy' and 'Pasting a webpage node into an email is refused'.

## 7. Shell

- [ ] 7.1 Draw the editor's panes and the Content, Style and Theme tabs, with the Content panel a schema form over the selected node's type and an image field's upload. Verify: tests named after the scenarios 'Editing a button's label in the Content panel shows on the canvas' and 'An empty page offers the palette'.
