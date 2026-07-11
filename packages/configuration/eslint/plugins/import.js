import { defineConfig } from "eslint/config";
// The import plugin itself is registered by the consumer (e.g. @nuxt/eslint), so we only override rules here
export default defineConfig({
  rules: {
    "import/consistent-type-specifier-style": "error",
  },
});
