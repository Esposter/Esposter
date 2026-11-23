import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { SCRIPT_FILES } from "#src/services/oxlint/selectorBan/constants";

// Source only — a test is exempt, which is why this is its own list rather than one of `restrictedSyntaxes`: a
// Schema built inside a test is a fixture with no interface to drift from, so the list's `excludeFiles` names the
// Tests.
export const RESTRICTED_SOURCE_SYNTAXES: SelectorBanList = {
  bans: [
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
      // The one-liner is where the `satisfies` goes missing, and there it is what catches a schema pointed at the wrong
      // Enum. Only the bare call as a declarator's whole initialiser is matched, the same shape as the union above
      message:
        "A `z.enum(SomeEnum)` schema ends in `satisfies z.ZodType<SomeEnum>` — it is what catches a schema pointed at the wrong enum. See the zod skill.",
      selector:
        "VariableDeclarator > CallExpression.init[callee.object.name='z'][callee.property.name='enum'][arguments.0.type='Identifier']",
    },
    {
      // A dynamic import is a split the reader cannot see from the top of the file, and Vite discovers the chunk late.
      // The exceptions are a lazy-loader contract and the split of a heavy dependency that an always-loaded module
      // Reaches, each disabled in place with what it keeps out of the eager graph. A test is exempt because it
      // Re-imports after mocking, which is what the dynamic import is for there
      message:
        "Import statically at the top of the file — `await import()` hides the dependency and defers Vite's discovery. An exception (a lazy-loader contract, or the split of a heavy dependency an always-loaded module reaches) disables this saying what it keeps out of the eager graph. See the typescript skill.",
      selector: "AwaitExpression > ImportExpression.argument",
    },
    {
      // Slicing `.buffer` from a view's own byte offset copies bytes a view over the same buffer reads in place. A view
      // Cannot start where the element size does not divide the offset, which is the one case a copy is needed, so that
      // Case disables this rule with its reason rather than the rule allowing the copy.
      message:
        "Read the bytes through a view: `new Float32Array(x.buffer, x.byteOffset, x.byteLength / Float32Array.BYTES_PER_ELEMENT)` — `.buffer.slice(x.byteOffset, …)` copies them. A copy an unaligned offset needs disables this with that reason. See the runtime-efficiency skill.",
      selector:
        "CallExpression[callee.object.property.name='buffer'][callee.property.name='slice'][arguments.0.property.name='byteOffset']",
    },
    {
      // The double cast launders a value past every check the compiler would have run — the hole `no-explicit-any`
      // Closes, spelled another way. A test is where the genuine seams mostly live (a class fake standing in for an
      // SDK class), so only source is held to it; a seam source cannot model either disables this with what the
      // Compiler cannot see. The inner cast is the node reported, so the directive sits above where the value starts.
      message:
        "`as unknown as T` is `any` with extra steps — model the type, or write a single `as T` where TS accepts it. A seam the type system cannot express disables this with what the compiler cannot see. See the typescript skill.",
      selector: "TSAsExpression > TSAsExpression.expression[typeAnnotation.type='TSUnknownKeyword']",
    },
  ],
  excludeFiles: ["**/*.test.ts", "**/test/setup.ts"],
  files: SCRIPT_FILES,
};
