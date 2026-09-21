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
];
