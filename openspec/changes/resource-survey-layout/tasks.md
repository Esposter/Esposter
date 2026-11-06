## 1. Layout

- [x] 1.1 Declare the creator's layout and registry on the shell: the bar, the structure region with its two tabs, the inspector and the canvas, in Design and Preview. Verify: the shell's layout check passes for the survey, and tests named after the scenarios 'Preview removes the editing regions' and 'The structure region has two tabs', written first and seen failing.
- [x] 1.2 Choose the inspector's tabs by the selection: the survey's texts, calculated values and theme with nothing selected, and a node's properties and conditions with one. Verify: tests named after 'A node selection offers no Theme tab' and 'Nothing selected offers the Theme tab', seen failing first.
- [x] 1.3 Make the bar's items: undo, redo and Add page pinned, the mode switch and the problems surface, and Import, Export and Clear in the overflow menu at every width. Verify: a test named after 'Import, Export and Clear are in the overflow menu', seen failing first.

## 2. Compact

- [ ] 2.1 Replace the narrow layout's tab per pane with the canvas and two sheets opened from the Structure and Inspector buttons. Verify: the scenario 'A compact window opens the inspector as a sheet' as a failing-first test, and a single driven-browser session at a phone width that selects a question and reads its settings while the question stays in view, since happy-dom has no layout.

## 3. Specs

- [x] 3.1 Rewrite the survey creator design as built: its Shell and Toolbar sentences, its narrow tabs and its key files. Verify: the OpenSpec citation checks pass in `scripts`.
