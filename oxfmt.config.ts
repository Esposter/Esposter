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
    // Generated output is the writer's, formatted or not, and a format pass never rewrites it
    "**/generated/**",
    "CHANGELOG*.md",
  ],
  objectWrap: "collapse",
  printWidth: 120,
});

export default oxfmtConfiguration;
