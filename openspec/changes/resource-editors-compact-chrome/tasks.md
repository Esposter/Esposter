## 1. Palettes

- [x] 1.1 Group the survey kinds and give each an icon, from one map keyed by every kind. Verify: a test named after the scenario 'Every survey kind has a category and an icon' written first and seen failing.
- [x] 1.2 Build one palette shell that groups, collapses and filters, and feed it from the survey, the page builder and the whiteboard. Verify: a test named after the scenario 'A search hides the groups with no match' written first and seen failing.

## 2. Density

- [ ] 2.1 Open the whiteboard's properties panel over the canvas. Verify: driven in the browser once after the edits. Open: the panel is an overlay in code; no test or browser run shows the canvas keeping its width, and on a canvas narrower than the toolbar and the panel together the panel can overlap the toolbar. The case 'Selecting an element leaves the canvas where it was' has no test: happy-dom has no layout.
- [x] 2.2 Cap the survey canvas at a readable width. Verify: none by test; the cap is one class on the canvas, and happy-dom has no layout to measure it by. The case 'A wide pane does not stretch a question' has no test.
- [ ] 2.3 Fold each toolbar's overflow into one menu and take one spacing from the UI library's tokens. Verify: a test named after the scenario 'A narrow toolbar folds into a menu' written first and seen failing. Open: the survey toolbar folds below an estimated width and its panes are tightened; the whiteboard's and the page builder's toolbars are not folded, no test covers the folded path (happy-dom measures width as zero).
