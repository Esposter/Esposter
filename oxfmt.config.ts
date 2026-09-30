import type { OxfmtConfig } from "oxfmt";

import { defineConfig } from "oxfmt";

const oxfmtConfiguration: OxfmtConfig = defineConfig({
  ignorePatterns: [
    ".agents/worktrees",
    "*.tsx",
    "**/tilemap.json",
    "**/auto-imports.d.ts",
    // A file snapshot is written by its test verbatim, beside what it holds
    "**/*.snapshot.*",
    "**/snapshot.json",
    "**/generated/**/*.json",
    "CHANGELOG*.md",
  ],
  objectWrap: "collapse",
  printWidth: 120,
});

export default oxfmtConfiguration;
