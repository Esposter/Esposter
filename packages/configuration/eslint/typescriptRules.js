import restrictedSyntaxes from "@esposter/configuration/eslint/restrictedSyntaxes.js";
// Everything typescript-eslint's strict/stylistic sets covered is now enforced natively by oxlint
// (see /docs/proposals/refactors/eslint-to-oxlint-migration). The only survivor is `no-restricted-syntax`:
// Oxlint has no selector-based rule yet, so these AST-selector bans stay on the ESLint side.
export default {
  // `protected` is still allowed — no `#` equivalent exists for subclass access.
  "no-restricted-syntax": [
    "error",
    ...restrictedSyntaxes,
    {
      message: "Use an ECMAScript `#` private member instead of the TypeScript `private` keyword.",
      selector:
        ":matches(PropertyDefinition, MethodDefinition, TSParameterProperty, TSAbstractPropertyDefinition, TSAbstractMethodDefinition)[accessibility='private']",
    },
    {
      // `expect.any` also trips a vitest/valid-expect false positive.
      message: "Avoid `expect.any` — capture the real value from the mock call and assert it exactly (or toBeTypeOf).",
      selector: "MemberExpression[object.name='expect'][property.name='any']",
    },
    {
      // Polling is banned repo-wide — see content/docs/architecture/no-polling.md.
      message:
        "Polling is banned — await the real completion signal (promises, events, flushPromises, waitForSynchronizedFunctions) instead of checking on a timer.",
      selector:
        ":matches(MemberExpression[object.name='expect'][property.name='poll'], MemberExpression[object.name='vi'][property.name=/^(waitFor|waitUntil)$/], CallExpression[callee.name=/^(waitFor|waitUntil)$/])",
    },
    {
      // The child combinators are load-bearing — they match only the property's own annotation, so
      // `Ref<T | undefined>`, `(T | undefined)[]`, tuple members and function params are untouched.
      message: "Declare the property optional (`field?: T`) instead of `field: T | undefined`.",
      selector:
        ":matches(TSPropertySignature, PropertyDefinition, TSAbstractPropertyDefinition) > TSTypeAnnotation > TSUnionType > TSUndefinedKeyword",
    },
  ],
  // Kept for later: enable via oxlint (`typescript/naming-convention`) once it supports the rule.
  // Computationally expensive under typescript-eslint, which is why it never shipped here.
  // "@typescript-eslint/naming-convention": [
  //   "error",
  //   {
  //     Format: ["camelCase", "PascalCase", "UPPER_CASE"],
  //     Selector: "variable",
  //     Types: ["array", "boolean", "number", "string"],
  //     LeadingUnderscore: "allow",
  //   },
  // ],
};
