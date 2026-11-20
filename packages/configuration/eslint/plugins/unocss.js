import unocss from "@unocss/eslint-config/flat";
import { defineConfig } from "eslint/config";

export default defineConfig({
  ...unocss,
  rules: { ...unocss.rules, "unocss/blocklist": "error", "unocss/order": "error", "unocss/order-attributify": "error" },
});
