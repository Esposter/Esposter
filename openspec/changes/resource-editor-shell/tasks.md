## 1. Shell

- [x] 1.1 Draw resolved regions docked, floating and as sheets, with a registry from content key to component. Verify: a test named after the scenario 'A region is drawn as the layout presents it', written first and seen failing, run under happy-dom.
- [x] 1.2 Wire the existing resize handle to each docked region's resolved size and limits, writing its answer through the package's resize. Verify: tests named after 'A handle resizes from the keyboard' and 'A resize past a limit stops at the limit', seen failing first.
- [x] 1.3 Hold each editor type's reader state in a Pinia store over local storage, read back through the package's parse. Verify: a test named after 'A stored size is restored on the next open', seen failing first.

## 2. Toolbar

- [ ] 2.1 Build the toolbar from the toggle group and icon buttons: groups and the variant slot. Verify: tests named after 'A group of tools is one tab stop' and 'Variants of a tool share one slot', seen failing first.
- [ ] 2.2 Fold what does not fit into the overflow menu with one VueUse resize observer, keeping the pinned items. Verify: a test named after 'A toolbar folds what does not fit into one menu', seen failing with the fold forced off.
- [ ] 2.3 Show an unavailable item disabled with its reason as its description. Verify: a test named after 'An unavailable tool says why', seen failing first.

## 3. Contextual panel and compact

- [ ] 3.1 Build the contextual panel with its header, the mixed value and the document settings state. Verify: tests named after 'Nothing selected shows the document settings' and 'Differing values show as mixed', seen failing first.
- [ ] 3.2 Place the tool region at the bottom and open the panel from a button as a sheet on a compact window. Verify: tests named after 'Selecting an element leaves the canvas where it was', 'A compact window opens the panel from a button', 'A compact window places the tool region at the bottom' and 'Escape closes a sheet and returns focus', and one driven-browser look at a phone width after the edits, since happy-dom has no layout.

## 4. Check

- [ ] 4.1 Run the layout check over every editor's layout and registry in one test. Verify: tests named after 'Every editor's layout passes the layout check' and 'A selection kind with no registered content fails the check', seen failing with a selection kind removed from a registry.
