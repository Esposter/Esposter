# Tasks

## 1. The toolbar over the text

- [ ] 1.1 Mount the text toolbar over the text being edited, with the note's marks, block items, lists and link control, and hide it when the edit ends. Verify: tests named after the scenarios 'Entering text edit shows the formatting toolbar over the text' and 'Leaving the text edit hides the text toolbar' written first and seen failing.
- [ ] 1.2 Take the node toolbar's place while the text is edited, and place the text toolbar above the text when there is room. Verify: tests named after the scenarios 'The node toolbar gives way to the text toolbar while editing' and 'The text toolbar sits above its text when the canvas has room' written first and seen failing.

## 2. The controls

- [ ] 2.1 Make the bold control bold the selected words through the note's mark command. Verify: a test named after the scenario 'The bold control bolds the selected words' written first and seen failing.
- [ ] 2.2 Make the link control link the selected words and remove the link when its address is cleared. Verify: tests named after the scenarios 'The link control links the selected words' and 'Clearing the link address removes the link' written first and seen failing.

## 3. The record

- [ ] 3.1 Update the canvas design's text editing paragraph and its key files to name the toolbar as built. Verify: `pnpm exec openspec validate resource-page-builder-text-toolbar --strict --no-interactive` passes.
