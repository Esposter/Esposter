## 1. Logging

- [ ] 1.1 Log a failed upgrade transaction's `done` only when the transaction carries its own error, so a thrown upgrade failure writes the open's one console error naming the thrown message. Verify: tests named after the scenarios 'A thrown upgrade failure is logged once' and 'A thrown upgrade failure keeps its message', each seen failing first.
- [ ] 1.2 Keep an upgrade aborted by a request error, with no thrown error, logged exactly once. Verify: a test named after the scenario 'An upgrade aborted by a request error is logged', seen passing before 1.1's change and after it.
- [ ] 1.3 Update the indexed-db design's `done` bullet in the same commit as 1.1, then archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/services/openspec` passes.
