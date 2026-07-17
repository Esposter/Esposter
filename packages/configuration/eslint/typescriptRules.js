import tseslint from "typescript-eslint";

export default Object.assign(
  ...tseslint.configs.strictTypeChecked.map((c) => {
    const rules = c.rules ?? {};
    delete rules["@typescript-eslint/no-base-to-string"];
    delete rules["@typescript-eslint/no-dynamic-delete"];
    delete rules["@typescript-eslint/no-empty-object-type"];
    delete rules["@typescript-eslint/no-redundant-type-constituents"];
    delete rules["@typescript-eslint/no-unnecessary-condition"];
    delete rules["@typescript-eslint/no-unsafe-argument"];
    delete rules["@typescript-eslint/no-unsafe-assignment"];
    delete rules["@typescript-eslint/no-unsafe-call"];
    delete rules["@typescript-eslint/no-unsafe-enum-comparison"];
    delete rules["@typescript-eslint/no-unsafe-function-type"];
    delete rules["@typescript-eslint/no-unsafe-member-access"];
    delete rules["@typescript-eslint/no-unsafe-return"];
    delete rules["@typescript-eslint/no-unused-vars"];
    delete rules["@typescript-eslint/prefer-reduce-type-parameter"];
    delete rules["@typescript-eslint/unbound-method"];
    // Rules we actually want to keep for ts files but conflict with vue files in the script setup section
    delete rules["@typescript-eslint/restrict-plus-operands"];
    delete rules["@typescript-eslint/restrict-template-expressions"];
    // Computationally expensive
    delete rules["@typescript-eslint/no-deprecated"];
    delete rules["@typescript-eslint/unified-signatures"];
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
        // `router.replace({ query })` is a query-string update, not navigation, so only `push` is banned.
        message:
          "Use `navigateTo(target, { replace: true })` instead of `router.push` for navigation. (`router.replace({ query })` for query-only updates is fine.)",
        selector:
          "CallExpression[callee.property.name='push']:matches([callee.object.name=/^\\$?router$/], [callee.object.callee.name='useRouter'], [callee.object.property.name='$router'])",
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
