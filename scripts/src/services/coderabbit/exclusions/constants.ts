// `R` carries the old and new paths; `M` reuses the one path. `A`/`D` are content decisions, never mechanical
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const RENAME_OR_MODIFY_ROW_REGEX: RegExp = /^(?<status>R\d*|M)\t(?<oldPath>[^\t]+)(?:\t(?<newPath>[^\t]+))?$/u;

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
