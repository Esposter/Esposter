import json from "@eslint/json";
import depend from "eslint-plugin-depend";
import { defineConfig } from "eslint/config";

/** @satisfies {import('@eslint/core').RulesConfig} */
const rules = { "depend/ban-dependencies": "error" };

// A banned package has to be declared in a manifest before a file can import it, so the manifest is the one place the
// Ban is read. A `**/*.js` entry would only repeat it on an import.
export default defineConfig(
  // @TODO: https://github.com/eslint/json/issues/222 — sort each manifest's `scripts` with `json/sort-keys` once one
  // Fix pass sorts them
  {
    extends: ["depend/flat/recommended"],
    files: ["package.json"],
    language: "json/json",
    plugins: { depend, json },
    rules,
  },
);
