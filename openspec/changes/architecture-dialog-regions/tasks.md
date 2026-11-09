# Tasks

## 1. Prove the overflow

- [ ] 1.1 Reproduce the overflow in a driven browser with a long column list in the sheet export dialog and in the column chooser's popover, recording the element that fails to shrink. Verify: the run-app procedure's measurements name the element, and the same measurement after the fix shows the body scrolling inside the frame.

## 2. The base regions

- [ ] 2.1 Draw the default slot in a body region and add a footer slot, both from one shared shortcut, with the bare-body prop. Verify: tests named after the scenarios 'A long list scrolls inside the body', 'A short body does not scroll', 'A bare body keeps the scroll without the padding', 'The footer stays in view' and 'No footer content draws no region' written first and seen failing.
- [ ] 2.2 Give the popover's panel the same body shortcut. Verify: a test that a popover with a list taller than its limit scrolls inside it, written first and seen failing.
- [ ] 2.3 Make the form dialog footer's submit name its form by id. Verify: tests named after the scenarios 'The footer's submit submits the body's form', 'Enter in a field submits the form' and 'The submit is disabled while a field fails' written first and seen failing.

## 3. The shells

- [ ] 3.1 Fill the footer slot from the styled dialog, the form dialog, the edit-form dialog's actions and the confirm dialog, keeping their props. Verify: the existing shell tests pass unchanged.

## 4. The call sites

- [ ] 4.1 Move the 28 dialogs that write a footer, and the 20 that write a scroll wrapper, onto the regions, dropping their own padding, scroll and fixed heights. Verify: the touched dialogs' tests pass and each dialog's body scrolls in the driven browser.
- [ ] 4.2 Add the scan test that fails a call site drawing its own scroll wrapper, padding, footer or fixed body height in the default slot. Verify: a test named after the scenario 'A call site that draws its own footer fails the scan' written first and seen failing.

## 5. The record

- [ ] 5.1 Update the dialog shell design, which says nothing else hand-rolls a dialog and its confirm pair and names the forward dialog as the one with its own shell, and the UI library page. Verify: `pnpm exec openspec validate architecture-dialog-regions --strict --no-interactive` passes.
