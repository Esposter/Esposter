## 1. Shell

- [x] 1.1 Draw resolved regions docked, floating and as sheets, with a registry from content key to component. Verify: a test named after the scenario 'A region is drawn as the layout presents it', written first and seen failing, run under happy-dom.
- [x] 1.2 Wire the existing resize handle to each docked region's resolved size and limits, writing its answer through the package's resize. Verify: tests named after 'A handle resizes from the keyboard' and 'A resize past a limit stops at the limit', seen failing first.
- [x] 1.3 Hold each editor type's reader state in a Pinia store over local storage, read back through the package's parse. Verify: a test named after 'A stored size is restored on the next open', seen failing first.
- [x] 1.4 Draw no handle on a docked region whose minimum and maximum size are equal. Verify: a test named after 'A region with equal limits draws no resize handle'.
- [x] 1.5 Inset each open overlay column by the open overlay bars at its ends, so a bar and a column never claim the same corner. Verify: a test named after 'An overlay column sits clear of an overlay bar', seen failing first.

## 2. Toolbar

- [x] 2.1 Build the toolbar from the toggle group and icon buttons: groups and the variant slot. Verify: tests named after 'A group of tools is one tab stop' and 'Variants of a tool share one slot', seen failing first.
- [x] 2.2 Fold what does not fit into the overflow menu with one VueUse resize observer, keeping the pinned items. Verify: a test named after 'A toolbar folds what does not fit into one menu', seen failing with the fold forced off.
- [x] 2.3 Show an unavailable item disabled with its reason as its description. Verify: a test named after 'An unavailable tool says why', seen failing first.

## 3. Contextual panel and compact

- [x] 3.1 Build the contextual panel with its header and the mixed value. Verify: a test named after 'Differing values show as mixed', seen failing first.
- [x] 3.2 Place the tool region at the bottom and open the panel from a button as a sheet on a compact window. Verify: tests named after 'Selecting an element leaves the canvas where it was', 'A compact window opens the panel from a button', 'A compact window places the tool region at the bottom' and 'Escape closes a sheet and returns focus', and one driven-browser look at a phone width after the edits, since happy-dom has no layout.
- [x] 3.3 Draw the sheets' buttons in a strip below the canvas on a compact window, in the flow. Verify: a test named after 'A compact window draws its sheet buttons below the canvas', written first and seen failing, run under happy-dom.

## 4. Check

- [x] 4.1 Run the layout check over each editor's layout and registry in that editor's own suite. Verify: a test named after 'An editor's layout passes the layout check' in each of the five editors' suites, and the engine's own test for a selection kind with no content, which reports it.
