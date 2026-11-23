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
  overrides: [
    // The import sort is for source; a Markdown code block keeps the import order its author wrote
    { files: ["**/*.md"], options: { sortImports: false } },
  ],
  printWidth: 120,
  // Mirrors perfectionist's default groups: a type import from a relative path sorts after the external value imports
  // A `#` subpath import sorts with the packages, as perfectionist classifies it external
  sortImports: {
    groups: [
      ["type-builtin", "type-external", "type-subpath"],
      ["builtin", "external", "subpath"],
      ["type-parent", "type-sibling", "type-index"],
      ["parent", "sibling", "index"],
      "unknown",
    ],
    internalPattern: [],
    partitionByComment: true,
  },
});

export default oxfmtConfiguration;
