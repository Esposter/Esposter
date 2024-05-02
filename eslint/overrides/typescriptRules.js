export default {
  "@typescript-eslint/ban-types": [
    "error",
    {
      types: {
        Omit: "Use `Except` instead",
        Function: false,
      },
    },
  ],
};
