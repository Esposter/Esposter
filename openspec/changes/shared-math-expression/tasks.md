## 1. Parser and evaluator

- [ ] 1.1 Write the tree model, the parser and the evaluator in `@esposter/shared` over every operator in the design's language table, each rule read off mathjs's `parse.js` first, with the nesting limit at a depth of 64. Verify: tests named after the scenarios 'Power binds tighter than a sign', 'Modulo takes the sign of the divisor', 'A trailing percent sign is a percentage of the left side', 'A name beside a number multiplies it', 'A bare comparison has a value', 'A chained comparison holds only when each pair does' and 'Nesting beyond the limit'.
- [ ] 1.2 Write the constant table and the function table, every numeric mathjs function in the design's categories under its name and arity, enumerated from mathjs's function reference. Verify: tests named after the scenarios 'Rounding goes half away from zero' and 'An unknown function'.
- [ ] 1.3 Return a positioned error from the parse in mathjs's words, and resolve names only as own entries. Verify: tests named after the scenarios 'An unclosed parenthesis' and 'A prototype member's name is unknown'.
- [ ] 1.4 Generate `mathExpressionParity.snapshot.json` with mathjs over the corpus, with every allowed difference listed by formula, and add the parity test. Verify: a test named after the scenario 'The parity corpus matches mathjs's recorded answers'.

## 2. Upstream triage

- [x] 2.1 Give every mathjs issue in the design's triage scope a verdict in the Upstream table, reproducing each defect against mathjs. Verify: each in-scope defect has a regression test naming its issue, and it fails against mathjs.
- [ ] 2.2 Fix each in-scope defect in the evaluator, and list it in the parity snapshot as a fix. Verify: the parity test and each defect's regression test pass.

## 3. Swap

- [ ] 3.1 Move the parse check out of the stored schema into the edit form schema, which also refuses an unbound name. Verify: tests named after the scenarios 'Expression naming an unbound column' and 'A stored expression the parser refuses'.
- [ ] 3.2 Compute a math cell through the new evaluator. Verify: a test named after the scenario 'A comparison shows one or zero', beside the existing compute tests.
- [ ] 3.3 Remove mathjs from the catalog, the app's manifest, the Vite pre-bundle list, the lockfile and the dependency register, with the residue sweep. Verify: `pnpm ls mathjs -r` lists nothing.
- [ ] 3.4 Archive the change, with the capability's design rewritten as built and the computed columns design describing the new language. Verify: `pnpm -C scripts exec vitest run src/services/openspec` passes.
