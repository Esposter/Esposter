# Tasks

## 1. The shared body

- [x] 1.1 Give the frame a scrolling body from the dialog change's shortcut, a footer slot and the bare-body flag. Verify: tests named after the scenarios 'A long body scrolls under a pinned title bar and footer' and 'A frame with no title draws only the body' written first and seen failing.
- [x] 1.2 Give the blade outlet, the editor shell's regions, the settings content and a right sidebar pane container the same body. Verify: tests named after the scenarios 'A blade's content is padded and scrolls' and 'A full-bleed region opts out of the padding' written first and seen failing.
- [x] 1.3 Move the layout's scroll into the default layout's slot. Verify: the friends and drafts pages, which fill the viewport, keep the window still while tall content scrolls inside the layout's main, and the explorer and achievements pages, which flow, grow the window with their content, in the driven browser; the published frame page is measured with task 4.1.

## 2. The async body and the dialog size

- [x] 2.1 Add the async body with its loading, error, empty and content slots. Verify: tests named after the scenarios 'A pending read draws the loading slot', 'A failed read draws the error slot with a retry' and 'An empty read draws the empty slot' written first and seen failing.
- [x] 2.2 Add the dialog's named size and replace the width literals. Verify: a test named after the scenario 'A named size sets the width' written first and seen failing.

## 3. The call sites

- [x] 3.1 Move the 9 blades, 8 settings panels, 5 panes, 9 regions and 4 pages onto the containers. Verify: each touched component's tests pass, and the pages, blades, panes and settings the driven session reaches, and the components of the design's defect table mounted on throwaway pages, scroll in the driven browser with no nested scroller on any of them.
- [x] 3.2 Move the lists whose loading, error and empty branches are a plain chain onto the async body, and leave the rest (ten migrated; the rule is in the design). Verify: the touched lists' tests pass.
- [x] 3.3 Replace the one plain hover latch with the VueUse composable and add the field label where fields drew the same mark. Verify: the touched components' tests pass.

## 4. The defects

- [x] 4.1 Fix the defects in the design's table. Verify: each is measured once in the driven browser after the fix, on the real component mounted on a throwaway page where the seed holds no data for its page.

## 5. The record

- [x] 5.1 Update the UI library design and the page-layout design, and record the deferred and rejected clusters under the deferred and rejected folders. Verify: `pnpm exec openspec validate architecture-container-regions --strict --no-interactive` passes.
