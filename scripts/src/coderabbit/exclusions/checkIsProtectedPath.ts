// The classes `exclusions.md` § When to exclude never lets out, whatever the diff says: a test is the behaviour
// Contract, docs and skills are the design record, and config, schema and migration inputs are small diffs with a
// Large blast radius. A rename out of a protected tree is still a change to that tree, so callers test both paths.
const PROTECTED_SUFFIXES = [
  ".test.ts",
  ".test-d.ts",
  ".yaml",
  ".yml",
  ".json",
  ".config.ts",
  ".config.js",
  ".config.mjs",
  ".config.cjs",
];
const PROTECTED_DIRECTORIES = [
  "apps/web/content/docs/",
  ".agents/skills/",
  "packages/db-schema/",
  "apps/web/server/db/migrations/",
];

export const checkIsProtectedPath = (path: string): boolean =>
  PROTECTED_SUFFIXES.some((suffix) => path.endsWith(suffix)) ||
  PROTECTED_DIRECTORIES.some((directory) => path.startsWith(directory));
