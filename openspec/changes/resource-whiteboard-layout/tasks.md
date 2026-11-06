## 1. Placing

- [x] 1.1 Add the placing tools and the lock to the editor store and the tool constants. Verify: tests named after the scenarios 'A placement returns the tool to select' and 'A locked tool stays in hand', written first and seen failing.
- [x] 1.2 Add the placing transition to the gesture reducer: a click places the default size, a drag sizes it. Verify: tests named after 'A click with a shape tool places a shape at the point' and 'A drag with a shape tool sizes the shape', seen failing first, and 'A placement the document check refuses leaves the document unchanged' seen failing with the check forced off.
- [x] 1.3 Register the tool shortcuts as commands in the whiteboard group. Verify: tests named after 'A tool shortcut switches the tool' and 'A shortcut typed into a text field is text', seen failing first.

## 2. Layout

- [x] 2.1 Declare the whiteboard's layout and its registry on the shell, with the panel content keyed by selection kind. Verify: the shell's layout check passes for the whiteboard, and tests named after 'The panel shows an arrow's route' and 'The properties panel is absent with nothing selected' seen failing first.
- [x] 2.2 Build the toolbar's items: select and hand, the shape slot, arrow, freehand, text, sticky note, image and the lock, with the image button opening a file picker into the existing insert. Verify: tests named after 'Every tool is in the top toolbar' and 'The image tool opens the file picker', seen failing first.
- [x] 2.3 Wire redo from the shared history into the whiteboard store and register it as a command beside undo, then add both to the view region beside zoom. Verify: a test named after 'Undo and redo are buttons beside zoom', seen failing first, and one that a redo restores the undone edit.
- [x] 2.4 Delete the palette, its drag and its search. Verify: the typecheck, and a `git grep` of the palette's component and composable names returning nothing outside the archive.
- [x] 2.5 Hold the compact toolbar at the bottom. Verify: a test named after 'A compact window moves the toolbar to the bottom', seen failing first.
- [ ] 2.6 Drive the whiteboard in a browser once after the edits at a wide window and at a phone width. Verify: a shape placed by click and by drag, the panel opening for a selection and absent for none, and the toolbar at the bottom with the panel behind its button on the narrow window; this has no test, since happy-dom has no layout.

## 3. Specs

- [x] 3.1 Rewrite the whiteboard design as built: its arrangement paragraph, its palette feature rows and its key files, naming the palette as rejected. Verify: the OpenSpec citation checks pass in `scripts`.
