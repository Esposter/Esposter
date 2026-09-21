// Source only — a test is exempt, which is why this is its own list rather than one of `restrictedSyntaxes`: a
// Schema built inside a test is a fixture with no interface to drift from, and the `.test.ts` overrides rebuild
// Their list without this one.
export default [
  {
    // A discriminated union is the one schema shape whose `satisfies z.ZodType<T>` is load-bearing: without it a
    // Variant that drifts from its interface stays a valid schema of something else. The zod skill states the
    // Rule with no exception, so the bare call as a declarator's whole initialiser is the finding — a `satisfies`
    // Wrapper is a `TSSatisfiesExpression` initialiser, which this does not match.
    message:
      "A `z.discriminatedUnion(…)` schema ends in `satisfies z.ZodType<T>` — without it a variant drifting from its interface is still a valid schema. See the zod skill.",
    selector: "VariableDeclarator > CallExpression.init[callee.property.name='discriminatedUnion']",
  },
  {
    // A guard that returns, followed by a `return` at the same level, is a two-branch chain with the `else` left
    // Off: the fall-through reads as code reached after the guard rather than instead of it. The consequent has to
    // Be a return for the sibling to be the other branch — a guard whose block does other work and a `return`
    // After an `if` that merely mutates are not matched. `no-negated-condition` then refuses `if (!x) … else …`,
    // So a negated guard swaps its branches (`if (x) return b; else return a;`), which is what `--fix` writes.
    message:
      "A guard whose fall-through is a `return` is a chain — write `if … else return …`, swapping the branches when the test is negated. See the typescript skill's control-flow reference.",
    selector: "IfStatement[alternate=null][consequent.type='ReturnStatement'] + ReturnStatement",
  },
];
