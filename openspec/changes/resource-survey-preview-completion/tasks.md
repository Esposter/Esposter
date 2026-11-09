## 1. Shared cells

- [ ] 1.1 Move the three dataset builders and their tests from the server folder to the shared dataset folder, and point the server's reads at them. Verify: the moved tests pass from their new paths, and the Responses read tests still pass.

## 2. The preview

- [ ] 2.1 Mount the preview in place of the canvas with the runner keyed by the run number, replacing the no-op completion listener with a handler that holds the answers, and draw them as a table of the Responses blade's columns and cells. Verify: a test named after the scenario 'Completing a preview shows its answers as a table' written first and seen failing.
- [ ] 2.2 Add the JSON view of the same answers beside the table. Verify: a test named after the scenario 'The JSON view shows the same answers' written first and seen failing.
- [ ] 2.3 Include the calculated values flagged for the result in the answers the results show. Verify: a test named after the scenario 'A calculated value flagged for the result is in the results' written first and seen failing.
- [ ] 2.4 Offer Preview Survey Again, which raises the run number, and clear the results when the owner leaves the preview. Verify: tests named after the scenarios 'Preview Survey Again starts the survey from its first page' and 'Leaving the preview clears its results' written first and seen failing.
- [ ] 2.5 Save nothing on completion, and show a blocked completion's error with no results. Verify: tests named after the scenarios 'Completing a preview saves no response' and 'A preview blocked by an error shows the error and no results' written first and seen failing.

## 3. The record

- [ ] 3.1 Rewrite the survey creator design's Preview paragraph and its Not built list as built, when the change is archived. Verify: `pnpm exec openspec validate resource-survey-preview-completion --strict --no-interactive` passes, and `pnpm -C scripts exec vitest run src/services/openspec` passes.
