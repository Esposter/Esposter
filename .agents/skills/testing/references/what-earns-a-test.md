# What Earns a Test

Read when deciding whether a subject earns a test at all, or which of two tests to keep. `SKILL.md` ("What to Test") states the rule; this page is the procedure that applies it, the kill-list of what never earns a line, and the case law where the question has already been decided.

## The keep test

The default is delete. A test is kept only when it passes these four steps in order:

1. **Name the regression.** Write one sentence: the behaviour a caller or user depends on that this test would catch breaking. If the sentence has to name a constant, a shape, a wiring, a mock or the test's own setup, there is no regression, and the test is deleted.
2. **Check the owner.** If a shared primitive, or the composable over the service, already fails for that regression, this test re-proves it. Keep the owner's test and delete this one. A wrapper keeps only its unique value-add (`references/wrapper-suites.md`).
3. **Check the enforcer.** If typecheck, lint, a Zod constraint or another test already fails for the same break, this test adds nothing.
4. **Keep it, and fold it.** A test that survives the first three is kept. A near-duplicate of it is folded into the test it shadows by widening that test's fixture, rather than kept beside it.

A guard clause decided in this file is the one exception to step 2, "Check the owner": it earns its own case even when a caller also reaches it, because the owner does not decide it here. Removing a test that a change made redundant is part of the change.

The keep test is the standard, not a budget: the aim is code with no test left that asserts nothing a reviewer would care about, and a test count is never a goal. A passing test that would still pass after the bug it names is not coverage, so it is deleted or rewritten until it would fail.

## Never earns a line

- **A constant, map, schema, enum or generated artifact restated.** The assertion fails only on a deliberate edit, and the diff is the review. The exception is a literal fixed outside this repo (a wire or protocol value, a security limit, a retention window), where catching the edit is the point.
- **Framework, filesystem or config wiring.** A directory exists, a config key holds the value just set, a loader was handed the right glob. Nothing a reviewer would merge fails on these. The one pin that earns its line is a literal a tool cannot import and silently drops: a JSON config's ignore list, or a config evaluated during `postinstall`, which runs before any workspace package is built. A path the suite beside it would already fail on does not count.
- **An existence or smoke check.** "renders", "is defined", "exports a function", "does not throw" with nothing else asserted.
- **A snapshot nobody reads a property of.** A whole generated or rendered output that no caller depends on in any particular field.
- **Type-level behaviour the typechecker already proves.** A `.test-d.ts` earns a place only where `tsc` cannot prove the behaviour.
- **Zod constraints** (min, max, regex, required fields) and **trivial lookups** — a function that indexes a constant map with a static fallback only restates the map. Test functions with real logic: recursion, sorting, branching.
- **A mock's own behaviour.** When the subject of the assertion is the double rather than the code under test, the test proves nothing about the code.
- **Production API added for a test's benefit.** Before building a completion signal, reset hook or inspection getter onto a primitive, grep for who else would call it. "Only the test" means the signal exists already: work through `getSynchronizedFunction` is drained by `waitForSynchronizedFunctions()`. A test-only export means the wrong seam, or a drain the repo already owns.
- **One product's copy of a generic mechanism**, when the mechanism's own suite already runs the same branch. The mechanism is tested once, generically. A product's test covers only what that product decides.
- **A name that describes no caller-visible behaviour** — "works", "handles the case", "is correct". If the name cannot be written as a regression, step 1 of the keep test fails.
- **A skipped test.** `test.skip`, `it.skip`, `describe.skip`, and a `.todo` on a test that should run, are deleted with the test they stand in for; a parked test is a test nobody runs. The one `describe.todo` that stays is the placeholder in a helper-only `.test.ts`, which Vitest needs a suite in to load (`references/test-helper-files.md`).
- **A tautological expectation.** The expected value is computed by the same code under test, or restates the input, so the assertion cannot fail while the code is wrong.

## Case law

- **Assert the exact value the code produces, never a weaker match.** Where the expected output is known, the test asserts it whole: a `toContain` fragment, a `toBeGreaterThan` on a count, or an `expect.any` stands in for a value the test could know, so it is rewritten to the exact value. A fragment match is kept only when the rest of the output is genuinely unknowable, and the test's title says so.
- **An authorization assertion stays with the procedure it guards.** A non-member or unauthorized rejection is not a duplicate of another procedure's, even when the same guard produces it: each procedure's rejection is its own regression. It is removed only when a named test already rejects that procedure for the same caller.
- **Test composables, not the service functions under them.** Composable tests cover the full call chain. A service is tested directly only when it has no composable wrapper.
- **One test per operation.** All of its field assertions go in one test; "updates name" and "updates bio" are one test.
- **A hand-written type over a third-party data file earns exactly one shape test.** Nothing typechecks a `declare module` against the bytes, so a dependency bump that renames a key passes every other gate silently. Assert one known record `toStrictEqual` its whole shape, plus any invariant the type encodes. This is the fixed-outside-the-repo exception, not a restated constant.
- **A refusal or a sweep a test asserts comes from the code under test.** When the test's own stub produces the failure, the test proves the stub: a stub answering `403` for an expired address proves nothing about the expiry its title names. Assert the procedure, service or sweep that produces it, or delete the test.
- **A coverage claim seeds what it names.** A test titled as covering a set of stores or rows seeds each one before the run and asserts it gone after; one that only names them passes on a sweep that leaves every one behind.
- **A UI change earns a component test only when it is cheap under the default setup.** Mount it and assert the rendered structure when that works out of the box. When it would first need a store graph, the tRPC client or a third-party component's internals mocked, write no test: the mocks become the subject, and the layout is for a person to check (the `run-app` skill).
