import unocss from "@unocss/eslint-config/flat";
import { defineConfig } from "eslint/config";

// The blocklist is vize's, read from the spellings the app's UnoCSS config refuses, so only the two order rules are left
// Here, and they go with ESLint (`openspec/changes/architecture-eslint-retirement/design.md`, Decisions)
export default defineConfig({
  ...unocss,
  rules: { ...unocss.rules, "unocss/order": "error", "unocss/order-attributify": "error" },
});
