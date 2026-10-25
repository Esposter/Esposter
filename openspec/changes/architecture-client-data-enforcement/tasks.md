# Tasks

Build order. Section 1 is the lint rung for the optimistic count, which first needs the shared field list so the rule and the selectors never disagree. Section 2 is the held-read rung, independent of section 1. Section 3 is the sweep that rewrites the two entries.

## 1. Optimistic count

- [ ] 1.1 Move the server-derived count fields into one exported list in `packages/configuration/eslint/serverCountFields.js`, and read it from the existing selectors in `restrictedSyntaxes.js`. The selectors' fixture tests are the proof: they pass unchanged.
      Verify: the selectors' test suite passes with no edit, and the field names appear once in the lint configuration.
- [ ] 1.2 Test first, as a fixture suite beside the persist-then-notify plugin's: a count written before the first `await` of a function that calls a mutation is flagged; the same write after the `await` is not; a write to the viewer's own mark before the `await` is not; a count write in a function that calls no mutation is not; a compound write `+=` before the `await` is flagged.
      Verify: the suite fails before the rule exists and passes once it does, and each case's name is a scenario in the spec delta.
- [ ] 1.3 Implement the rule in `scripts/src/services/oxlint/countWriteAfterSettle/`, register it in `scripts/src/oxlint/countWriteAfterSettle.ts`, and wire it in the oxlint configuration beside persist-then-notify.
      Verify: the rule runs over `apps/web/app` with no finding after any existing site is fixed in its own commit. The lint pass itself is CI's on the push.
- [ ] 1.4 Fix each existing site the rule finds, one commit per store, re-reading the count after the write settles instead of writing it before.
      Verify: each store's own test asserts the count is unchanged until its mutation resolves, and then shows the re-read value.

## 2. Held read

- [ ] 2.1 Test first, in the harness's test file: a read is held open by a deferred resolver, a second read is issued in the same tick, and the second settles while the first is still held.
      Verify: the test fails on the current batched link, which answers both only once the held read settles.
- [ ] 2.2 Extract the batch choice into `apps/web/app/services/trpc/createHttpBatchingLink.ts`, taking the environment, and have the client plugin call it. The test build takes the unbatched branch, and production takes the batched one.
      Verify: the held-read test from 2.1 passes, and a unit test of `createHttpBatchingLink` shows the production branch batches two reads into one request.

## 3. Sweep and specs

- [ ] 3.1 Rewrite the two anti-pattern entries in the client-data design. The optimistic count names the lint rule and the store tests, and the held read names the harness's unbatched link and its test. The third "not yet" entry, guessing an unknown prior state, stays as it is.
      Verify: a search for "Not yet mechanically enforced" in `openspec/specs/architecture/client-data/design.md` returns only the unknown-prior-state entry.
- [ ] 3.2 Add the two requirements to the client-data spec, and update its Key files to name the new rule and the link function.
      Verify: `openspec validate` passes with the change, and the spec's scenarios match the names in 1.2 and 2.1.
