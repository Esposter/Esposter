# Tasks

## 1. The shared body

- [x] 1.1 Give the frame a scrolling body from the dialog change's shortcut, a footer slot and the bare-body flag. Verify: tests named after the scenarios 'A long body scrolls under a pinned title bar and footer' and 'A frame with no title draws only the body' written first and seen failing.
- [x] 1.2 Give the blade outlet, the editor shell's regions, the settings content and a right sidebar pane container the same body. Verify: tests named after the scenarios 'A blade's content is padded and scrolls' and 'A full-bleed region opts out of the padding' written first and seen failing.
- [ ] 1.3 Move the layout's scroll into the default layout's slot. Verify: the four pages lose their wrappers and still scroll in the driven browser.

## 2. The async body and the dialog size

- [x] 2.1 Add the async body with its loading, error, empty and content slots. Verify: tests named after the scenarios 'A pending read draws the loading slot', 'A failed read draws the error slot with a retry' and 'An empty read draws the empty slot' written first and seen failing.
- [x] 2.2 Add the dialog's named size and replace the width literals. Verify: a test named after the scenario 'A named size sets the width' written first and seen failing.

## 3. The call sites

- [ ] 3.1 Move the 9 blades, 8 settings panels, 5 panes, 9 regions and 4 pages onto the containers. Verify: each touched component's tests pass and each scrolls in the driven browser.
- [ ] 3.2 Move the 25 lists onto the async body. Verify: the touched lists' tests pass.
- [ ] 3.3 Replace the hand-rolled hover latches with the VueUse composable, merge the sheet's undo and redo buttons and add the field label. Verify: the touched components' tests pass.

## 4. The defects

- [ ] 4.1 Fix the defects in the design's table. Verify: each is measured once in the driven browser after the fix.

## 5. The record

- [ ] 5.1 Update the UI library design and the page-layout design, and record the deferred and rejected clusters under the deferred and rejected folders. Verify: `pnpm exec openspec validate architecture-container-regions --strict --no-interactive` passes.
