import tseslint from "typescript-eslint";

export default {
  ...Object.assign(
    {},
    ...tseslint.configs.strictTypeChecked.map((c) => {
      const rules = c.rules ?? {};
      delete rules["@typescript-eslint/no-base-to-string"];
      delete rules["@typescript-eslint/no-redundant-type-constituents"];
      delete rules["@typescript-eslint/no-unsafe-argument"];
      delete rules["@typescript-eslint/no-unsafe-assignment"];
      delete rules["@typescript-eslint/no-unsafe-call"];
      delete rules["@typescript-eslint/no-unsafe-enum-comparison"];
      delete rules["@typescript-eslint/no-unsafe-member-access"];
      delete rules["@typescript-eslint/no-unsafe-return"];
      delete rules["@typescript-eslint/no-unused-vars"];
      delete rules["@typescript-eslint/prefer-reduce-type-parameter"];
      delete rules["@typescript-eslint/unbound-method"];
      // Rules we actually want to keep for ts files but conflict with vue files in the script setup section
      delete rules["@typescript-eslint/restrict-plus-operands"];
      delete rules["@typescript-eslint/restrict-template-expressions"];
      // Computationally expensive
      delete rules["@typescript-eslint/no-floating-promises"];
      delete rules["@typescript-eslint/no-misused-promises"];
      delete rules["@typescript-eslint/no-unnecessary-condition"];
      return rules;
    }),
    ...tseslint.configs.stylisticTypeChecked.map((c) => {
      const rules = c.rules ?? {};
      delete rules["@typescript-eslint/no-empty-function"];
      delete rules["@typescript-eslint/no-empty-interface"];
      return rules;
    }),
  ),
  "@typescript-eslint/consistent-type-exports": "error",
  // Computationally expensive
  // "@typescript-eslint/naming-convention": [
  //   "error",
  //   {
  //     selector: "variable",
  //     format: ["strictCamelCase", "UPPER_CASE"],
  //     types: ["boolean", "number", "string", "array"],
  //   },
  // ],
};
