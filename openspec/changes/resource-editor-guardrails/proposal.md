# Editor guardrails

## Why

A guided editor's document has rules: a slot accepts some kinds, a survey's names are unique, an email's sections hold columns. Today the rules are enforced where the reader cannot see them coming. A palette offers every kind and the core refuses the wrong one afterward, the survey check runs when a save is attempted and shows its first issue in a transient alert, the webpage lists its findings in a tab and the email shows its validator's messages above a preview.

## What Changes

A guided editor offers only what its document accepts and lists every problem in one place.

- An insertion point offers the kinds its slot accepts and no others, from the core's accepted types.
- An action that is valid elsewhere but not here is disabled and says why.
- One problems surface, in the top bar, lists the findings of the editor's check, each naming the node it concerns, and choosing one selects that node.
- A save the check refuses leaves the findings in view with the editor's not-saved state, not only an alert.

## Capabilities

- **resource/editor-guardrails** (new)

## Impact

The survey creator, the page builder and the email editor each map their existing check to one finding shape and gain the surface. No check's rules change, and no document model changes.
