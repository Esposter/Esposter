import type { OxfmtConfig } from "oxfmt";

import { AGENT_WORKTREES_DIRECTORY } from "#src/services/constants";
import { defineConfig } from "oxfmt";

const oxfmtConfiguration: OxfmtConfig = defineConfig({
  ignorePatterns: [
    AGENT_WORKTREES_DIRECTORY,
    "*.tsx",
    "**/tilemap.json",
    "**/auto-imports.d.ts",
    // A file snapshot is written by its test verbatim, beside what it holds
    "**/*.snapshot.*",
    "**/snapshot.json",
    // A patch is applied byte for byte, and its context lines are exact, so a format pass never rewrites one
    "**/*.patch",
    // Generated output is the writer's, formatted or not, and a format pass never rewrites it
    "**/generated/**",
    "CHANGELOG*.md",
  ],
  objectWrap: "collapse",
  printWidth: 120,
});

export default oxfmtConfiguration;
