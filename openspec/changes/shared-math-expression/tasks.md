## 1. Parser and compiler

- [x] 1.1 Write the tree model, the parser and the compiler in `@esposter/shared` over every operator in the design's language table, each rule read off mathjs's `parse.js` first, with the nesting limit at a depth of 64. The compiler resolves each name to its slot, each function to its implementation and folds each constant subtree, keeping `and`, `or`, `&`, `|` and the conditional lazy. Verify: tests named after the scenarios 'Power binds tighter than a sign', 'Modulo takes the sign of the divisor', 'A trailing percent sign is a percentage of the left side', 'A name beside a number multiplies it', 'A bare comparison has a value', 'A chained comparison holds only when each pair does' and 'Nesting beyond the limit'.
- [x] 1.2 Write the constant table and the function table, every mathjs function that maps numbers to a number or a boolean at some arity, enumerated by probing the installed mathjs. Verify: tests named after the scenarios 'Rounding goes half away from zero' and 'An unknown function'.
- [x] 1.3 Return a positioned error from the parse in mathjs's words, and resolve names only as own entries. Verify: tests named after the scenarios 'An unclosed parenthesis' and 'A prototype member's name is unknown'.
- [x] 1.4 Generate `mathExpressionParity.snapshot.json` with mathjs over the corpus, with every allowed difference listed by formula, and add the parity test. Verify: a test named after the scenario 'The parity corpus matches mathjs's recorded answers'.

## 2. Upstream triage

- [x] 2.1 Give every mathjs issue in the design's triage scope a verdict in the Upstream table, each with its evidence. Verify: every row names a verdict and the reproduction, the owner or the answering link behind it.
- [x] 2.2 Fix each in-scope defect and build each in-scope feature in the language, and list each in the parity snapshot as a fix. Verify: each has a regression test whose title names its issue and which fails against mathjs, and the parity test passes.

## 3. Swap

- [ ] 3.1 Move the parse check out of the stored schema into the edit form schema, which also refuses an unbound name. Verify: tests named after the scenarios 'Expression naming an unbound column' and 'A stored expression the parser refuses'.
- [ ] 3.2 Replace the per-cell `computeValue` with `compileSheetColumns`, which compiles the computed columns once, finds cycles and binds to rows with each aggregation built once, and move every caller to it, the row store holding the compiled columns and the bound reader as computed values. Verify: tests named after the scenarios 'A comparison shows one or zero' and 'Two math columns depend on each other', and a bench of every cell of a large sheet with a math, a regular expression and an aggregation column, run on the old compute and the new one, with both numbers in the commit.
- [ ] 3.3 Remove mathjs from the catalog, the app's manifest, the Vite pre-bundle list, the lockfile and the dependency register, with the residue sweep. Verify: `pnpm ls mathjs -r` lists nothing.
- [ ] 3.4 Archive the change, with the capability's design rewritten as built and the computed columns design describing the new language and the compiled columns. Verify: `pnpm -C scripts exec vitest run src/services/openspec` passes.
