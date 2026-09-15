// Git's status for a rename that changed no bytes; one that also edited the file carries its similarity score
export const PURE_RENAME_STATUS = "R100";

// Protected by path rather than by contents, so a relocation is as much a change as an edit: a loader reads a
// Config by name, a migration's filename is its ordering, a docs page's folder is its status and a skill's is its
// Ownership. Moving one of these is a decision, and the sweep that moves it says so. A test is not here: it moves
// With its subject in every sweep there is, and where it sits claims nothing about behaviour.
export const RELOCATION_PROTECTED_SUFFIXES: string[] = [
  ".config.cjs",
  ".config.js",
  ".config.mjs",
  ".config.ts",
  ".json",
  ".yaml",
  ".yml",
];
export const RELOCATION_PROTECTED_DIRECTORIES: string[] = [
  ".agents/skills/",
  "apps/web/content/docs/",
  "apps/web/server/db/migrations/",
  "packages/db-schema/",
];
