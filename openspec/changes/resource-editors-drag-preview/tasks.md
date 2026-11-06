## 1. The shared session

- [ ] 1.1 Extract the page builder's drag into a session over a supplied draw and a supplied set of accepting slots, taking the autoscroll and the touch hold from `useDragReorder`. Verify: a test named after the scenario 'A drag at the edge scrolls' written first and seen failing.
- [ ] 1.2 Hold the pending insertion in the session and draw it through the editor's own renderer. Verify: a test named after the scenario 'A palette kind is drawn in the slot it would land in' written first and seen failing.
- [ ] 1.3 Cancel on Escape and on a release over no slot. Verify: tests named after the scenarios 'A cancelled drag leaves no history entry' and 'A release on a refusing slot inserts nothing' written first and seen failing.
- [ ] 1.4 Insert or move on release as one history entry. Verify: a test named after the scenario 'A release inserts once' written first and seen failing.

## 2. The three editors

- [ ] 2.1 Move the page builder onto the session, drawing the preview in the webpage and email canvases. Verify: driven in the browser once after the edits.
- [ ] 2.2 Make the survey Creator's palette and canvas draggable. Verify: a test named after the scenario 'A question is dragged from the palette' written first and seen failing.
- [ ] 2.3 Give the whiteboard's palette drag a ghost at the pointer. Verify: driven in the browser once after the edits.
