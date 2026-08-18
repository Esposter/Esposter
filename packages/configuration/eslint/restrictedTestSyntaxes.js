// Test-file-only bans, appended to the script-side ones the same way the date bans are for `.vue` — eslint
// Replaces a rule's options rather than merging them, so the base entries are carried over at the call site.
export default [
  {
    // A bare `vi.fn()` infers `unknown` parameters, so destructuring a recorded call is an implicit-`any` error
    // And `mockResolvedValue` accepts anything. Only the zero-argument form is banned: `vi.fn(impl)` infers its
    // Signature from the implementation and needs no annotation.
    message: "Give `vi.fn` its signature — `vi.fn<(input: Foo) => Promise<void>>()`.",
    selector:
      "CallExpression[callee.object.name='vi'][callee.property.name='fn'][arguments.length=0]:not([typeArguments]):not([typeParameters])",
  },
];
