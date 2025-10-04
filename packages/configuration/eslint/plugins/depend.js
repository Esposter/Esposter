import json from "@eslint/json";
import depend from "eslint-plugin-depend";
import { defineConfig } from "eslint/config";
/** @satisfies {import('@eslint/core').RuleConfig} */
const rules = {
  "depend/ban-dependencies": [
    "error",
    {
      allowed: ["dotenv", "fs-extra"],
    },
  ],
};

export default defineConfig(
  {
    extends: ["depend/flat/recommended"],
    files: ["package.json"],
    language: "json/json",
    plugins: {
      depend,
      json,
    },
    rules,
  },
  {
    extends: ["depend/flat/recommended"],
    files: ["**/*.js"],
    plugins: {
      depend,
    },
    rules,
  },
);
