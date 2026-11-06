## 1. Layout

- [ ] 1.1 Declare the email's layout and registry on the shell: the bar, Blocks, the inspector and the canvas, in Design and Preview. Verify: the shell's layout check passes for the email, and a test named after the scenario 'Preview removes the editing regions', written first and seen failing.
- [ ] 1.2 Move the dataset picker, the preview text field and the device toggle into the bar, and Import MJML into its overflow menu. Verify: tests named after 'The device toggle applies to both modes' and 'Import MJML is in the overflow menu' and 'Import MJML is in the overflow menu on a compact window', seen failing first.
- [ ] 1.3 Choose the inspector's tabs by the selection: the email's settings with nothing selected, Content and Style with a node. Verify: tests named after 'Nothing selected shows the email's settings' and 'A node selection offers Content and Style only', seen failing first.

## 2. Findings

- [ ] 2.1 Map the compile's validation messages to findings and list them in the problems surface in both modes, in place of the alert above the preview. Verify: tests named after 'A validation message is a finding in Design' and 'A refused compile keeps the last good message', seen failing first.
- [ ] 2.2 Select the node a message names. Verify: a test named after 'A message that names a node selects it', seen failing first.

## 3. Compact and specs

- [ ] 3.1 Put Blocks and the inspector behind their buttons as sheets when the window is compact. Verify: 'A compact window opens the inspector as a sheet' written as a test and seen failing, then one pass in the driven browser at a phone's width.
- [ ] 3.2 Rewrite the email editor design as built: its shell, bar and preview sentences and its key files. Verify: the OpenSpec citation checks pass in `scripts`.
