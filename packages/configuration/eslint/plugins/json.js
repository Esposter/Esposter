import json from "@eslint/json";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    extends: ["json/recommended"],
    files: ["**/*.json"],
    language: "json/json",
    plugins: { json },
    rules: {
      "json/sort-keys": "error",
    },
  },
]);
