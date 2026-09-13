// Git's status for a rename that changed no bytes; one that also edited the file carries its similarity score
// Instead, and the new path is what `path_filters` names
export const PURE_RENAME_STATUS = "R100";

// Protection guards what a file says, not where it sits. A test is the behaviour contract, so an edit to one is
// Never mechanical — but moving it says nothing, and a sweep moves every colocated test with its subject, so a
// Rule that refused those would refuse every sweep there is.
export const CONTENT_PROTECTED_SUFFIXES: string[] = [".test-d.ts", ".test.ts"];

// The other half is protected by its path rather than by its contents, so a relocation is as much a change as an
// Edit: a loader reads a config by name, a migration's filename is its ordering, a docs page's folder is its
// Status and a skill's is its ownership. Moving one of these is a decision, and the sweep that moves it says so.
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
