import noNull from "@esposter/configuration/eslint/rules/noNull.js";

export default {
  plugins: { esposter: { rules: { "no-null": noNull } } },
  rules: { "esposter/no-null": "warn" },
};
