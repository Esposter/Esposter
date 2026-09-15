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
// The Nuxt trees a path names something in: a page's path is its route, a layout's, a middleware's and a
// Plugin's their names, a server route's its URL, a public asset's the URL a template writes as a string, and
// A component's its auto-import name — each read by nothing an import edit would show, and none of them a
// Typecheck failure (`typedPages` is off, and an unknown component types as `any`)
export const RELOCATION_PROTECTED_DIRECTORIES: string[] = [
  ".agents/skills/",
  "apps/web/app/components/",
  "apps/web/app/layouts/",
  "apps/web/app/middleware/",
  "apps/web/app/pages/",
  "apps/web/app/plugins/",
  "apps/web/content/",
  "apps/web/public/",
  "apps/web/server/api/",
  "apps/web/server/db/migrations/",
  "apps/web/server/plugins/",
  "apps/web/server/routes/",
  "packages/db-schema/",
];
