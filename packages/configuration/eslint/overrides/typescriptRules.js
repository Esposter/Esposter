export default {
  "@typescript-eslint/no-restricted-types": [
    "error",
    {
      types: {
        Omit: "Use `Except` instead",
      },
    },
  ],
  "@typescript-eslint/no-unused-expressions": [
    "error",
    {
      allowShortCircuit: true,
      allowTernary: true,
    },
  ],
};
