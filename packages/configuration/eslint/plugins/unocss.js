import unocss from "@unocss/eslint-config/flat";
import { defineConfig } from "eslint/config";
/** @type {import("@eslint/core").ConfigObject} */
const config = unocss;

export default defineConfig({
  ...config,
  rules: {
    ...config.rules,
    "unocss/order": "error",
    "unocss/order-attributify": "error",
  },
});
