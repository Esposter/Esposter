import type { RestrictedImportPath } from "./models/RestrictedImportPath.ts";
import type { RestrictedImportPattern } from "./models/RestrictedImportPattern.ts";

import { CONTEXT_MESSAGE, USE_ROUTE_MESSAGE, VUETIFY_MESSAGE } from "./messages.ts";
import { getAutoImportedPaths } from "./services/getAutoImportedPaths.ts";

// Banned in every tree, the child process ones aside: the Vuetify 0 bans hold everywhere but the UI library and the packages
export const OTHER_RESTRICTED_IMPORT_PATHS: RestrictedImportPath[] = [
  {
    importNames: ["randomUUID"],
    message:
      "Use the global `crypto.randomUUID()` — it needs no import. (`node:crypto`'s `randomUUID` is identical but forces a Node-only import.)",
    name: "node:crypto",
  },
  {
    importNames: ["parseArgs"],
    message:
      "A command line is a citty command (the `cli` skill): `parseArgs` stops at parsing, with no usage, help or subcommands to go with it.",
    name: "node:util",
  },
  { importNames: ["useRoute"], message: USE_ROUTE_MESSAGE, name: "vue-router" },
  { importNames: ["inject", "provide"], message: CONTEXT_MESSAGE, name: "vue" },
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
  group: ["@esposter/*", "azure-mock", "keyframe-store", "parse-tmx", "vue-phaserjs"],
  message:
    "The Nuxt configuration loads in `nuxt prepare`, the app's postinstall, before any workspace library is built — a runtime import of one fails every fresh install. Import the npm package the library wraps instead; types are fine.",
};
export const SHARED_APP_IMPORT_PATTERN: RestrictedImportPattern = {
  group: ["@/**", "~/**"],
  message:
    "`shared/` is parsed by the server too, so it may not reach into the client-only app tree — see openspec/specs/architecture/module-boundaries/design.md. Move the code to `shared/`, or give the client concern its own twin under `app/`.",
};
const PACKAGE_ALIAS_IMPORT_PATTERN: RestrictedImportPattern = {
  group: ["@/**", "~/**"],
  message:
    "A package addresses its own source through the `#src/*` subpath imports its manifest declares, never a tsconfig `paths` alias — a `paths` entry re-points into whichever package is compiling, so a sibling bundling this one from source resolves it to nothing. See openspec/specs/architecture/build-pipeline/design.md. (`apps/web` is the only tree that keeps `@/` — those are Nuxt's own aliases.)",
};
const PACKAGE_RELATIVE_IMPORT_PATTERN: RestrictedImportPattern = {
  group: ["./*", "./**", "../*", "../**"],
  message:
    "A package addresses its own source through `#src/*`, never a relative specifier — a relative path breaks the moment the file moves, and `#src` is resolved from the importing file's own package.json so it survives being compiled by a sibling. See openspec/specs/architecture/build-pipeline/design.md.",
};
export const PACKAGE_IMPORT_PATTERNS: RestrictedImportPattern[] = [
  PACKAGE_ALIAS_IMPORT_PATTERN,
  PACKAGE_RELATIVE_IMPORT_PATTERN,
];
export const MOD_IMPORT_PATTERN: RestrictedImportPattern = {
  group: ["#src/*", "@/**", "~/**"],
  message:
    "A Claude Code hooks module imports its own files by relative path alone: the engine refuses any other specifier at load. See the claude-mods skill.",
};
