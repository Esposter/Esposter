## Why

A preview ends nowhere. The Creator hands the runner a completion listener that does nothing, so a completed preview stays on its last page with its Complete button. An owner who wants to see what a respondent's answers would store, or to run the survey again, has to leave the preview and come back to it. The reference product shows a completed preview's results as a table or as JSON, with a button to run the preview again.

## What Changes

- A completed preview shows the answers a respondent's completion would store, as a table, with a JSON view beside it. The table reads the same columns and cells the Responses blade reads.
- A completed preview offers Preview Survey Again, which clears the answers and starts the survey from its first page.
- Leaving the preview clears its results.
- Completing a preview saves no response, and a completion blocked by an error shows that error and no results.

## Capabilities

### Modified Capabilities

- `survey-creator`: a completed preview shows its results, restarts and saves nothing.

## Impact

The preview becomes a component of its own. It holds the runner and the results, and it is mounted only while the preview is on. The cell builders the Responses blade reads move from the server into shared code, so the preview and the blade read one set of cell rules. No stored data, server route or response changes.
