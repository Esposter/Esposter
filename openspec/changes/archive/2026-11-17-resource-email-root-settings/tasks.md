# Tasks

## 1. The inspector with nothing selected

- [x] 1.1 Offer the email's settings beside the prompt when nothing is selected, and keep Content and Style with a node selected. Verify: the test named after the scenario 'Nothing selected asks for a selection' written first and seen failing, and the test named after the scenario 'A node selection offers Content and Style only' kept passing.

## 2. The fields

- [x] 2.1 Add the language and direction fields to the settings form. Verify: tests named after the scenarios 'The language setting sets the language of the email' and 'The direction setting turns the email right to left' written first and seen failing.
- [x] 2.2 Add the title and the body width and background fields, the width typed as a pixel length. Verify: tests named after the scenarios 'Editing the title sets the title of the compiled email' and 'A body width sets the width of the email' written first and seen failing.
- [x] 2.3 Add the font list field. Verify: the test named after the scenario 'A font added to the list loads in the compiled email' written first and seen failing.
- [x] 2.4 Make each settings change one undo step and let a cleared field remove its value. Verify: tests named after the scenarios 'Clearing a settings field removes it from the email' and 'A settings change is one undo step' written first and seen failing.

## 3. The record

- [x] 3.1 Update the email layout design's decision on the nothing-selected state, and its key files, and the email editor's design for the settings. Verify: `pnpm exec openspec validate resource-email-root-settings --strict --no-interactive` passes.
