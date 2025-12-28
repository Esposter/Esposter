export default {
  "@typescript-eslint/no-empty-object-type": "off",
  "@typescript-eslint/no-restricted-types": [
    "error",
    {
      types: {
        Omit: "Use `Except` instead",
      },
    },
  ],
  "@typescript-eslint/no-unsafe-function-type": "off",
  "@typescript-eslint/no-unused-expressions": [
    "error",
    {
      allowShortCircuit: true,
      allowTernary: true,
    },
  ],
  "@typescript-eslint/unified-signatures": "off",
};
