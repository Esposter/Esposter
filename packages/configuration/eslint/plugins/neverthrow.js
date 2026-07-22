import languageOptions from "@esposter/configuration/languageOptions";
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
