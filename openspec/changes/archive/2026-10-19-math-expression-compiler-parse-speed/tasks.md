## 1. Baseline

- [x] 1.1 Install mathjs outside the workspace at the version the parity record names, and time the package's built `dist` against it over the design's table. Verify: each row reads as the design says, or the table is corrected before any code moves. Done after the code, not before it: the table was corrected to the measured numbers, as the design now records.

## 2. Climbing

- [x] 2.1 Write the binding-power table and the climbing rule, with the comparison chain, and point the conditional at it. Verify: `pnpm test src/services/parser src/services/compiler --run` in `packages/math-expression-compiler` passes unchanged, the parity snapshot included. Done: 124 tests pass, and a differential run of 120000 generated formulas against the HEAD parser found no difference in tree or error.
- [x] 2.2 Delete the ten binary rule files and their enum members and map entries, fold `parseLeftAssociative` into `parseNullish`, and move the binary entries out of `MathExpressionOperatorMap`. Verify: the package suite passes, and `pnpm test shared/services/resource/sheet/column/transformation/compileMathTransformation.test.ts --run` in `apps/web` passes. Done: the package suite passes, 128 tests, and the `apps/web` suite passes, 7 tests.

## 3. Tokenizer

- [x] 3.1 Compare character codes for digits and ASCII word characters, keeping the expressions for characters outside ASCII. Verify: the parser suite passes, including its names in other scripts. Done: the differential run includes accented, Arabic-digit and CJK names.
- [x] 3.2 Take a match by its start and one slice, and read a delimiter's length from its first character. Verify: the parser suite passes, and a CPU profile of the long sum shows the tokenizer's share fallen. Done: the suite and the differential run pass; the profile was not taken, since the comparison above is the measure the change ships on.

## 4. Ship

- [x] 4.1 Rerun the comparison. Verify: every row is level with mathjs or ahead of it; a row still behind sends the work back to the profile rather than out. Done: every row of the table is level or ahead in plain node. Under vitest the 300000-argument parse is still about 1.4 times mathjs, which the design records and the bench report shows.
- [x] 4.2 Rerun `pnpm bench` in the package and commit the regenerated parse and compile reports, with the before and after in the commit body. Done: the reports are regenerated on the host the before and after comparison ran on; the commit itself is left to the owner.
- [x] 4.3 Rewrite the language design's rule-chain paragraph, its diagram and its one-file-per-rule decision for the climbing rule, naming per-level recursion as rejected and why.
- [ ] 4.4 Run the code review over the change, both lanes, and the finishing audit, then archive the change.
