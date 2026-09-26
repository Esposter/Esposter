import type { OxfmtConfig } from "oxfmt";

import { defineConfig } from "oxfmt";

const oxfmtConfiguration: OxfmtConfig = defineConfig({
  ignorePatterns: [
    ".agents/worktrees",
    "*.tsx",
    "**/tilemap.json",
    "**/auto-imports.d.ts",
    "**/__snapshots__",
    "**/snapshot.json",
    "**/generated/**/*.json",
    "CHANGELOG*.md",
  ],
  objectWrap: "collapse",
  printWidth: 120,
});

export default oxfmtConfiguration;
