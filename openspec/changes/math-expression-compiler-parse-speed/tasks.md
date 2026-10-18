## 1. Baseline

- [ ] 1.1 Install mathjs outside the workspace at the version the parity record names, and time the package's built `dist` against it over the design's table. Verify: each row reads as the design says, or the table is corrected before any code moves.

## 2. Climbing

- [ ] 2.1 Write the binding-power table and the climbing rule, with the comparison chain, and point the conditional at it. Verify: `pnpm test src/services/parser src/services/compiler --run` in `packages/math-expression-compiler` passes unchanged, the parity snapshot included.
- [ ] 2.2 Delete the ten binary rule files and their enum members and map entries, fold `parseLeftAssociative` into `parseNullish`, and move the binary entries out of `MathExpressionOperatorMap`. Verify: the package suite passes, and `pnpm test shared/services/resource/sheet/column/transformation/compileMathTransformation.test.ts --run` in `apps/web` passes.

## 3. Tokenizer

- [ ] 3.1 Compare character codes for digits and ASCII word characters, keeping the expressions for characters outside ASCII. Verify: the parser suite passes, including its names in other scripts.
- [ ] 3.2 Take a match by its start and one slice, and read a delimiter's length from its first character. Verify: the parser suite passes, and a CPU profile of the long sum shows the tokenizer's share fallen.

## 4. Ship

- [ ] 4.1 Rerun the comparison. Verify: every row is level with mathjs or ahead of it; a row still behind sends the work back to the profile rather than out.
- [ ] 4.2 Rerun `pnpm bench` in the package and commit the regenerated parse and compile reports, with the before and after in the commit body.
- [ ] 4.3 Rewrite the language design's rule-chain paragraph, its diagram and its one-file-per-rule decision for the climbing rule, naming per-level recursion as rejected and why.
- [ ] 4.4 Run the code review over the change, both lanes, and the finishing audit, then archive the change.
