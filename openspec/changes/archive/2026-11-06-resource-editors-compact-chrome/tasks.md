## 1. Palettes

- [x] 1.1 Group the survey kinds and give each an icon, from one map keyed by every kind. Verify: a test named after the scenario 'Every survey kind has a category and an icon' written first and seen failing.
- [x] 1.2 Build one palette shell that groups, collapses and filters, and feed it from the survey, the page builder and the whiteboard. Verify: a test named after the scenario 'A search hides the groups with no match' written first and seen failing.

## 2. Density

- [x] 2.1 Open the whiteboard's properties panel over the canvas. Verify: driven in a browser once after the edits. Selecting an element opened the panel with the canvas keeping its width, and on a canvas narrower than the toolbar and the panel together the panel, set below the toolbar's row, no longer overlapped it. The case 'Selecting an element leaves the canvas where it was' has no test: happy-dom has no layout.
- [x] 2.2 Cap the survey canvas at a readable width. Verify: none by test; the cap is one class on the canvas, and happy-dom has no layout to measure it by. The case 'A wide pane does not stretch a question' has no test.
- [x] 2.3 Fold the survey toolbar's overflow into one menu and take one spacing from the UI library's tokens. Verify: a test named after the scenario 'A narrow toolbar folds into a menu', seen failing with the fold forced off, and a browser run showing the row whole in a wide pane and folded in a narrow one. The whiteboard's tool row and the page builder's device toggle are a few icon buttons that fit any width an editor opens at, so they are not folded.
