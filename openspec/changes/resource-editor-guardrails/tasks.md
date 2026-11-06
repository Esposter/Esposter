## 1. The finding and the surface

- [x] 1.1 Define one finding shape: the node it concerns, a severity and a message. Verify: the typecheck, with each editor's mapping in the tasks below returning it.
- [x] 1.2 Build the problems surface: a count in the top bar, a list, and selection of a finding's node. Verify: tests named after the scenarios 'The problems surface lists each finding with its node', 'A document with no findings shows no count' and 'Choosing a finding selects its node', written first and seen failing.
- [x] 1.3 Compute an editor's findings from its document in one computed value behind a settle delay. Verify: a test named after 'A fix removes its finding', seen failing first.

## 2. Never offered

- [x] 2.1 Build the insertion menu from the core's accepted types for the slot at the insertion point, in the survey creator, the page builder and the email editor. Verify: tests named after 'An insertion menu offers only the kinds the slot accepts', 'A kind no slot accepts here is absent', 'Owner adds a rating question' and 'Owner adds a question to a selected page', seen failing first.
- [x] 2.2 Show a move or insert that the selection cannot take as disabled with the refusal's reason. Verify: a test named after 'An action the selection cannot take says why', seen failing first.

## 3. Findings per editor

- [x] 3.1 Map the survey check to findings, all errors, and show not saved while one stands. Verify: tests named after 'A refused save leaves the findings in view' and 'The problems surface lists each finding with its node', seen failing first.
- [x] 3.2 Map the page builder's critique to findings, all warnings. Verify: a test named after 'A warning does not refuse a save', seen failing first.
- [x] 3.3 Map the email validator's messages to findings by the severity the validator gives. Verify: a test named after 'A validator message becomes a finding', seen failing first.
- [x] 3.4 Decide how a scenario's title becomes a test's title: the test carries the scenario's title with its first letter lowercased, since the repository's lint rule holds test titles to lowercase. Verify: the convention is written into the `openspec` skill's spec-tests reference and the guardrails design, and the test under 3.2 matches it.
