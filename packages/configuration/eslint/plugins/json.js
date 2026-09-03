import jsonFilePatterns from "@esposter/configuration/eslint/jsonFilePatterns.js";
import { configs } from "eslint-plugin-jsonc";
import { defineConfig } from "eslint/config";

// Generated JSON is not ours to lint: a drizzle migration snapshot is written and re-read by `db:gen`, and the
// Asset blobs are exports from the tools that drew them. The entry buys time rather than green — the snapshots
// Alone are most of the JSON in the repo — and it keeps a future rule from reporting on a file nobody edits.
const GENERATED_JSON_FILE_PATTERNS = ["**/server/db/migrations/**/*.json", "**/app/assets/**/*.json"];
// JSONC by contract rather than by extension, so a comment is legal in them however the suffix reads.
// `recommended-with-json` bans comments outright; `recommended-with-jsonc` is that set without the ban.
const JSONC_FILE_PATTERNS = [".vscode/**/*.json", "**/tsconfig*.json"];
// A manifest stays with `@eslint/json` in `plugins/depend.js`, and this is why it cannot be both: a file carries
// One `language`, `depend/ban-dependencies` listens on `Document > Object > Member` — momoa's AST, not the
// ESTree-shaped one this plugin parses to — so a jsonc entry reaching a manifest would leave that rule matching
// Nothing at all, and matching nothing looks exactly like passing.
const PACKAGE_MANIFEST_FILE_PATTERNS = ["**/package.json"];

export default defineConfig(
  {
    extends: [configs["flat/recommended-with-json"]],
    files: jsonFilePatterns,
    ignores: [...GENERATED_JSON_FILE_PATTERNS, ...JSONC_FILE_PATTERNS, ...PACKAGE_MANIFEST_FILE_PATTERNS],
  },
  {
    extends: [configs["flat/recommended-with-jsonc"]],
    files: JSONC_FILE_PATTERNS,
    ignores: GENERATED_JSON_FILE_PATTERNS,
  },
);
