# Tasks

## 1. The shared primitives

- [ ] 1.1 Add the library's in-place text field, which commits on Enter or blur and cancels on Escape. Verify: tests named after the scenarios 'Escape restores the title' and 'Editing a question's title on the surface' written first and seen failing.
- [ ] 1.2 Add the library's adorner bar anchored to an element's box. Verify: a test named after the scenario 'Nothing selected shows no adorner' written first and seen failing.

## 2. Text on the surface

- [ ] 2.1 Edit the selected element's and a page's title and description in place through the panel's own prop write. Verify: tests named after the scenarios 'A run of typing is one undo step' and 'An unselected question is not edited by a click' written first and seen failing.
- [ ] 2.2 Edit a choice question's choices in place. Verify: tests named after the scenarios 'Enter in the last choice adds one', 'An emptied choice is removed on commit', 'The last choice cannot be removed' and 'Alt and the arrow keys reorder a choice' written first and seen failing.

## 3. Adorners and kind

- [ ] 3.1 Draw the adorner bar with the required flag, duplicate, delete, move and the rate type, reusing the outline's commands. Verify: tests named after the scenarios 'The required adorner toggles the flag' and 'The duplicate adorner copies the question after it' written first and seen failing.
- [ ] 3.2 Add the convert-kind command to the engine with the keep and drop rules, and the confirm when content is dropped. Verify: tests named after the scenarios 'A choice question becomes another choice kind with its choices', 'A change that drops content asks first' and 'A kind change undoes as one step' written first and seen failing.

## 4. Add controls

- [ ] 4.1 End each page with the add-question control, and the survey with the new-page skeleton. Verify: tests named after the scenarios 'The add control inserts at the end of its page' and 'The skeleton adds a page' written first and seen failing.

## 5. The record

- [ ] 5.1 Update the survey creator design and its Not built list, and record the deferred rows as deferred records. Verify: `pnpm exec openspec validate resource-survey-creator-inline-editing --strict --no-interactive` passes.
