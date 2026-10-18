## 1. Decision

- [ ] 1.1 Decide which logging option to build: (a) the open logs the thrown error and the transaction stays silent; (b) the transaction logs every failed `done` and the open stops logging the thrown error; (c) the open records the thrown error as the abort's cause and the transaction logs `done` only when no cause is recorded. Decide nothing here beyond the pick. Verify: the picked option is checked against the three requirements in this change's spec.

## 2. Logging

- [ ] 2.1 Implement the picked option so a thrown upgrade failure writes one console error that names the thrown message. Verify: a test named after the scenario 'A thrown upgrade failure is logged once' seen failing first, and one named after 'A thrown upgrade failure keeps its message' seen failing first.
- [ ] 2.2 Keep an upgrade aborted by a request error, with no thrown error, logged exactly once. Verify: a test named after the scenario 'An upgrade aborted by a request error is logged' seen failing first.
- [ ] 2.3 Update the indexed-db design's `done` bullet in the same commit as 2.1 so it describes the picked option. Verify: the bullet reads as the picked option describes it, checked by a reviewer in that commit.
