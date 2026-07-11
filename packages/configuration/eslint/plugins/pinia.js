import pinia from "eslint-plugin-pinia";
import { defineConfig } from "eslint/config";
/** @type {import("@eslint/core").ConfigObject} */
const config = pinia.configs["all-flat"];

export default defineConfig({
  ...config,
  rules: {
    ...config.rules,
    "pinia/require-setup-store-properties-export": "off",
  },
});
