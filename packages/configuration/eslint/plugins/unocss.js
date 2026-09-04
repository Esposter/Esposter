import unocss from "@unocss/eslint-config/flat";
import { defineConfig } from "eslint/config";
/** @type {import("@eslint/core").ConfigObject} */
const configuration = unocss;

export default defineConfig({
  ...configuration,
  rules: {
    ...configuration.rules,
    "unocss/order": "error",
    "unocss/order-attributify": "error",
  },
});
