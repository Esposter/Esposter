import restrictedSyntaxes from "@esposter/configuration/eslint/restrictedSyntaxes.js";
import tseslint from "typescript-eslint";

export default Object.assign(
  // Rules oxlint covers are switched off by eslint-plugin-oxlint (appended last); only rules it
  // Leaves enabled need hand-deleting here.
  ...tseslint.configs.strictTypeChecked.map((c) => {
    const rules = c.rules ?? {};
    delete rules["@typescript-eslint/no-dynamic-delete"];
    delete rules["@typescript-eslint/no-empty-object-type"];
    delete rules["@typescript-eslint/no-unnecessary-condition"];
    return rules;
  }),
  ...tseslint.configs.stylisticTypeChecked.map((c) => {
    const rules = c.rules ?? {};
    delete rules["@typescript-eslint/no-empty-function"];
    return rules;
  }),
  {
    "@typescript-eslint/consistent-type-exports": "error",
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            importNames: ["randomUUID"],
            message: "Use the global `crypto.randomUUID()` instead of importing `randomUUID` from `node:crypto`.",
            name: "node:crypto",
          },
        ],
      },
    ],
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
        message:
          "Avoid `expect.any` — capture the real value from the mock call and assert it exactly (or toBeTypeOf).",
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
    // Computationally expensive
    // "@typescript-eslint/naming-convention": [
    //   "error",
    //   {
    //     Format: ["camelCase", "PascalCase", "UPPER_CASE"],
    //     Selector: "variable",
    //     Types: ["array", "boolean", "number", "string"],
    //     LeadingUnderscore: "allow",
    //   },
    // ],
  },
);
