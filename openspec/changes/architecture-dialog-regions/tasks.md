# Tasks

## 1. The base regions

- [ ] 1.1 Draw the default slot in a body region and add a footer slot, both from one shared shortcut, with the bare-body prop. Verify: tests named after the scenarios 'A long list scrolls inside the body', 'A short body does not scroll', 'A bare body keeps the scroll without the padding', 'The footer stays in view' and 'No footer content draws no region' written first and seen failing.
- [ ] 1.2 Give the popover's panel the same body shortcut. Verify: a test that a popover with a list taller than its limit scrolls inside it, written first and seen failing.
- [ ] 1.3 Make the styled form dialog's footer submit name its form by id. Verify: tests named after the scenarios 'The footer's submit submits the body's form', 'Enter in a field submits the form' and 'The submit is disabled while a field fails' written first and seen failing.

## 2. The shells

- [ ] 2.1 Fill the footer slot from the styled dialog, the form dialog, the edit-form dialog's actions and the confirm dialog, keeping their props. Verify: the existing shell tests pass unchanged, and the tests named after the scenarios 'A dialog shows its title with a close control' and 'A long body scrolls inside the dialog' pass.

## 3. The call sites

- [ ] 3.1 Move the 28 dialogs that write a footer, and the 20 that write a scroll wrapper, onto the regions, dropping their own padding, scroll and fixed heights. Verify: the touched dialogs' tests pass, and once after all the edits a driven-browser run opens the sheet export dialog and the column chooser with a long column list and measures that the body scrolls inside the frame with the footer in view.
- [ ] 3.2 Add the scan test that fails a call site drawing its own scroll wrapper, padding, footer or fixed body height in the default slot. Verify: a test named after the scenario 'A call site that draws its own footer fails the scan' written first and seen failing.

## 4. The record

- [ ] 4.1 Update the dialog shell design, which says nothing else hand-rolls a dialog and its confirm pair and names the forward dialog as the one with its own shell, and the UI library page. Verify: `pnpm exec openspec validate architecture-dialog-regions --strict --no-interactive` passes.
