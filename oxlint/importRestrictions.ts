import type { RestrictedImportPath } from "#oxlint/models/RestrictedImportPath";
import type { RestrictedImportPattern } from "#oxlint/models/RestrictedImportPattern";

import { CONTEXT_MESSAGE, USE_ROUTE_MESSAGE, VUETIFY_MESSAGE } from "#oxlint/messages";
import { getAutoImportedPaths } from "#oxlint/services/getAutoImportedPaths";

// An id is minted by `v7` from `uuid` alone: `randomUUID` and `v4` both make a version 4, which the id validators refuse
const RANDOM_UUID_MESSAGE =
  "Mint an id with `v7` from `uuid`, never `randomUUID`: a version 4 is refused by the id validators. See openspec/specs/architecture/id-validation/design.md.";
const V4_MESSAGE =
  "Mint an id with `v7` from `uuid`, never `v4`: a version 4 is refused by the id validators. See openspec/specs/architecture/id-validation/design.md.";
// Banned in every tree, the child process ones aside: the Vuetify 0 bans hold everywhere but the UI library and the packages
export const OTHER_RESTRICTED_IMPORT_PATHS: RestrictedImportPath[] = [
  { importNames: ["randomUUID"], message: RANDOM_UUID_MESSAGE, name: "crypto" },
  { importNames: ["randomUUID"], message: RANDOM_UUID_MESSAGE, name: "node:crypto" },
  { importNames: ["v4"], message: V4_MESSAGE, name: "uuid" },
  {
    importNames: ["parseArgs"],
    message:
      "A command line is a citty command (the `cli` skill): `parseArgs` stops at parsing, with no usage, help or subcommands to go with it.",
    name: "node:util",
  },
  { importNames: ["useRoute"], message: USE_ROUTE_MESSAGE, name: "vue-router" },
  { importNames: ["inject", "provide"], message: CONTEXT_MESSAGE, name: "vue" },
  {
    importNames: ["Editor"],
    message:
      "Type an editor as `@tiptap/core`'s `Editor`: every tiptap callback hands that one over, and the Vue editor extends it, so either passes where it is named. See the tiptap skill.",
    name: "@tiptap/vue-3",
  },
];
// A console child of a windowless parent, or any `detached` child, opens its own terminal window on Windows unless
// `windowsHide` is set. The wrappers force it, so every child process goes through them; a type import stays free.
const CHILD_PROCESS_MESSAGE =
  "Import the hidden-window wrappers from `@esposter/shared-node/child-process` — a child process spawned without `windowsHide` opens its own terminal window on Windows.";
const CHILD_PROCESS_IMPORT_PATHS: RestrictedImportPath[] = [
  { allowTypeImports: true, message: CHILD_PROCESS_MESSAGE, name: "child_process" },
  { allowTypeImports: true, message: CHILD_PROCESS_MESSAGE, name: "node:child_process" },
];
export const RESTRICTED_IMPORT_PATHS: RestrictedImportPath[] = [
  ...OTHER_RESTRICTED_IMPORT_PATHS,
  ...CHILD_PROCESS_IMPORT_PATHS,
];
// The app's imports are Nuxt's, written on `nuxt prepare` (the install's postinstall)
export const APP_RESTRICTED_IMPORT_PATHS: RestrictedImportPath[] = [
  ...RESTRICTED_IMPORT_PATHS,
  ...getAutoImportedPaths("apps/web/.nuxt/types/imports.d.ts", "Nuxt", false),
];
export const VUETIFY_IMPORT_PATH: RestrictedImportPath = { message: VUETIFY_MESSAGE, name: "@vuetify/v0" };
export const VUETIFY_IMPORT_PATTERN: RestrictedImportPattern = { group: ["@vuetify/v0/*"], message: VUETIFY_MESSAGE };
export const WORKSPACE_LIBRARY_IMPORT_PATTERN: RestrictedImportPattern = {
  allowTypeImports: true,
  group: ["@esposter/*", "keyframe-store", "parse-tmx", "vue-phaserjs"],
  message:
    "The Nuxt configuration loads in `nuxt prepare`, the app's postinstall, before any workspace library is built — a runtime import of one fails every fresh install. Import the npm package the library wraps instead; types are fine.",
};
export const SHARED_APP_IMPORT_PATTERN: RestrictedImportPattern = {
  group: ["#src/**"],
  message:
    "`shared/` is parsed by the server too, so it may not reach into the client-only app tree — see openspec/specs/architecture/module-boundaries/design.md. Move the code to `shared/`, or give the client concern its own twin under `app/`.",
};
const PACKAGE_ALIAS_IMPORT_PATTERN: RestrictedImportPattern = {
  group: ["@/**", "~/**"],
  message:
    "A package addresses its own source through the `#src/*` subpath imports its manifest declares, never a tsconfig `paths` alias — a `paths` entry re-points into whichever package is compiling, so a sibling bundling this one from source resolves it to nothing. See openspec/specs/architecture/build-pipeline/design.md.",
};
// A query is part of the specifier a subpath import substitutes into its pattern, so `#src/a.html?raw` names
// `./app/a.html?raw.ts`, a file that does not exist
const SUBPATH_QUERY_IMPORT_PATTERN: RestrictedImportPattern = {
  message:
    'A `#` name takes no query — the manifest pattern swallows it. Pass it as a glob option: `import.meta.glob("#src/…", { eager: true, import: "default", query: "?raw" })`. See the file-organization skill, references/import-aliases.md.',
  regex: String.raw`^#[^?]*\?`,
};
const RELATIVE_IMPORT_GROUP = ["./*", "./**", "../*", "../**"];
const RELATIVE_IMPORT_MESSAGE =
  "A package addresses its own source through the subpath imports its manifest declares (`#src/*`; the root config's folders `#oxlint/*` and `#vite/*`; the web app's `#shared/*`, `#server/*`, `#scripts/*`, `#configuration/*`), never a relative specifier — a relative path breaks the moment the file moves, and a `#` name is resolved from the importing file's own package.json, so it survives being compiled by a sibling. See the file-organization skill, references/import-aliases.md.";
// The web app's own source is named by its manifest's subpath imports, which Node resolves as Nuxt does. Every tree
// Refuses Nuxt's aliases and a query on a `#` name, since a root file and the shared configuration's lint entries
// Reach out of their package by path and only the app's own files refuse a relative import
export const WEB_ALIAS_IMPORT_PATTERNS: RestrictedImportPattern[] = [
  {
    group: ["@/**", "@@/**", "~/**", "~~/**"],
    message:
      "The web app addresses its own source through the subpath imports its manifest declares — `#src/*` for `app/`, `#shared/*`, `#server/*`, `#scripts/*`, `#configuration/*`, `#modules/*` — each naming its file (`/index` for a folder), so a script runs under bare `node`. See the file-organization skill, references/import-aliases.md.",
  },
  SUBPATH_QUERY_IMPORT_PATTERN,
];
// The app's configuration and scripts reach `db-schema`'s source by path, its one relative import: Nuxt loads them at
// Install, before any workspace package is built, and a subpath import never targets a file outside its own package
export const WEB_IMPORT_PATTERNS: RestrictedImportPattern[] = [
  ...WEB_ALIAS_IMPORT_PATTERNS,
  {
    group: [...RELATIVE_IMPORT_GROUP, "!../../../packages/db-schema/src/**", "!../../../../packages/db-schema/src/**"],
    message: RELATIVE_IMPORT_MESSAGE,
  },
];
const PACKAGE_RELATIVE_IMPORT_PATTERN: RestrictedImportPattern = {
  group: RELATIVE_IMPORT_GROUP,
  message: RELATIVE_IMPORT_MESSAGE,
};
export const PACKAGE_IMPORT_PATTERNS: RestrictedImportPattern[] = [
  PACKAGE_ALIAS_IMPORT_PATTERN,
  PACKAGE_RELATIVE_IMPORT_PATTERN,
  SUBPATH_QUERY_IMPORT_PATTERN,
];
export const MOD_IMPORT_PATTERN: RestrictedImportPattern = {
  group: ["#src/*", "@/**", "~/**"],
  message:
    "A Claude Code hooks module imports its own files by relative path alone: the engine refuses any other specifier at load. See the claude-mods skill.",
};
