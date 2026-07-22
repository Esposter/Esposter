import languageOptions from "@esposter/configuration/eslint/languageOptions.js";
import neverthrow from "@ninoseki/eslint-plugin-neverthrow";
import { defineConfig } from "eslint/config";

export default defineConfig({
  files: ["**/*.ts"],
  languageOptions,
  plugins: { neverthrow },
  rules: {
    "neverthrow/must-use-result": "error",
  },
});
