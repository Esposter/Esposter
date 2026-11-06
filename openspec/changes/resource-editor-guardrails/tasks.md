## 1. The finding and the surface

- [ ] 1.1 Define one finding shape: the node it concerns, a severity and a message. Verify: the typecheck, with each editor's mapping in the tasks below returning it.
- [ ] 1.2 Build the problems surface: a count in the top bar, a list, and selection of a finding's node. Verify: tests named after the scenarios 'The problems surface lists each finding with its node', 'A document with no findings shows no count' and 'Choosing a finding selects its node', written first and seen failing.
- [ ] 1.3 Compute an editor's findings from its document in one computed value behind a settle delay. Verify: a test named after 'A fix removes its finding', seen failing first.

## 2. Never offered

- [ ] 2.1 Build the insertion menu from the core's accepted types for the slot at the insertion point, in the survey creator, the page builder and the email editor. Verify: tests named after 'An insertion menu offers only the kinds the slot accepts' and 'A kind no slot accepts here is absent', seen failing first.
- [ ] 2.2 Show a move or insert that the selection cannot take as disabled with the refusal's reason. Verify: a test named after 'An action the selection cannot take says why', seen failing first.

## 3. Findings per editor

- [ ] 3.1 Map the survey check to findings, all errors, and show not saved while one stands. Verify: tests named after 'A refused save leaves the findings in view' and 'The problems surface lists each finding with its node', seen failing first.
- [ ] 3.2 Map the page builder's critique to findings, all warnings. Verify: a test named after 'A warning does not refuse a save', seen failing first.
- [ ] 3.3 Map the email validator's messages to findings by the severity the validator gives. Verify: a test named after 'A validator message becomes a finding', seen failing first.
- [ ] 3.4 Decide, as the owner, how a scenario's title becomes a test's title. The spec names 'A warning does not refuse a save' in sentence case, the repository's lint rule holds test titles to lowercase, and the test at HEAD is lowercase, so a search for the spec's title finds the spec and no test. Choose one convention for both the delta and the tests, then have the traceability check hold it. Verify: the chosen convention is written into the owning spec and the test under 3.2 matches it.
