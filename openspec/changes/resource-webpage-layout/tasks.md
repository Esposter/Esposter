## 1. Layout

- [x] 1.1 Declare the webpage's layout and registry on the shell: the bar, Blocks, the inspector and the canvas. Verify: the shell's layout check passes for the webpage, and a test named after the scenario 'Nothing selected offers Page and Theme', written first and seen failing.
- [x] 1.2 Choose the inspector's tabs by the selection and remove the Check tab. Verify: tests named after 'A node selection offers Content and Style only' and 'The Check tab is gone', seen failing first.
- [x] 1.3 Move the device toggle into the bar. Verify: a test named after 'The device toggle sets the frame and the style tab's breakpoint', seen failing first.

## 2. Findings

- [x] 2.1 Map the critique's findings to warnings in the problems surface, each naming its node. Verify: tests named after 'A critique finding is a warning in the problems surface' and 'A warning does not refuse a save', seen failing first.

## 3. Compact and specs

- [ ] 3.1 Draw Blocks and the inspector as sheets in the compact and medium classes, each behind its button. Verify: the scenarios 'A compact window opens the inspector as a sheet' and 'A medium window opens the inspector as a sheet' as tests seen failing first, then a driven-browser look at a phone width once. The sheets are drawn; the buttons that open them wait on the shell's compact change, and the driven-browser look is the owner's.
- [x] 3.2 Bring the canvas and critique designs up to date: where the device toggle sits and what replaced the Check panel, and the critique spec's Check-panel scenarios 'low-contrast text is reported with its node', 'text at exactly 4.5 to 1 is not reported', 'text is checked against the background its section sets', 'an unreadable colour is reported unchecked', 'a fixed width with no mobile override is reported', 'a mobile override that narrows the node is not reported', 'an invite to an unpublished survey is reported', 'a survey lookup that fails leaves the invite unchecked', 'an unsaved edit changes the findings' and 'choosing a finding selects its node'. Verify: the citation checks in `scripts` pass, and each scenario named here has a test that passes.
