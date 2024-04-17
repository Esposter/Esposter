import tseslint from "typescript-eslint";

export default tseslint.config({
  rules: {
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          Omit: "Use `Except` instead",
          Function: false,
        },
      },
    ],
    "@typescript-eslint/no-explicit-any": "off",
  },
})[0];
