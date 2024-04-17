import tseslint from "typescript-eslint";

export default tseslint.config({
  rules: {
    ...Object.assign(
      {},
      ...tseslint.configs.strictTypeChecked.map((c) => c.rules ?? {}),
      ...tseslint.configs.stylisticTypeChecked.map((c) => c.rules ?? {}),
    ),
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        format: ["strictCamelCase", "UPPER_CASE"],
        types: ["boolean", "number", "string", "array"],
      },
    ],
    "@typescript-eslint/no-base-to-string": "off",
    "@typescript-eslint/no-redundant-type-constituents": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-enum-comparison": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/prefer-reduce-type-parameter": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/unbound-method": "off",
  },
})[0];
