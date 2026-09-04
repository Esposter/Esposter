import pinia from "eslint-plugin-pinia";
import { defineConfig } from "eslint/config";
/** @type {import("@eslint/core").ConfigObject} */
const configuration = pinia.configs["all-flat"];

export default defineConfig({
  ...configuration,
  rules: {
    ...configuration.rules,
    "pinia/require-setup-store-properties-export": "off",
  },
});
