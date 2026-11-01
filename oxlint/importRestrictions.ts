import type { RestrictedImportPath } from "./RestrictedImportPath.ts";
import type { RestrictedImportPattern } from "./RestrictedImportPattern.ts";

import { ok } from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import { CONTEXT_MESSAGE, USE_ROUTE_MESSAGE, VUETIFY_MESSAGE } from "./messages.ts";

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
// What a tree has auto-imported is written by the tool that does it, as `const name: typeof import('module').name` and its
// Types as `export type { … }` followed by the module they come from. Reading that file makes the ban follow the tool, so a
// Name it starts auto-importing is banned with no list kept here. A module that starts with a dot or a hash is a local file
const RUNTIME_DECLARATION_REGEX = /typeof import\('(?<module>[^'#.][^']*)'\)\.(?<name>\w+)/gu;
const TYPE_DECLARATION_REGEX =
  /export type \{(?<names>[^}]*)\}\s*(?:from '(?<fromModule>[^'#.][^']*)'|import\('(?<importModule>[^'#.][^']*)'\))/gu;
export const getAutoImportedPaths = (
  declarationsPath: string,
  source: string,
  allowTypeImports: boolean,
): RestrictedImportPath[] => {
  const declarationsUrl = new URL(`../${declarationsPath}`, import.meta.url);
  // A tree that has not run `nuxt prepare` (a fresh worktree) has no generated file yet, and every command that loads the
  // Configuration, formatting included, would fail on it. CI installs first, so the ban always holds there
  if (!existsSync(declarationsUrl)) return [];

  const declarations = readFileSync(declarationsUrl, "utf8");
  const moduleNamesMap = new Map<string, string[]>();
  const addNames = (module: string, names: string[]) => {
    moduleNamesMap.set(module, [...(moduleNamesMap.get(module) ?? []), ...names]);
  };
  for (const { groups } of declarations.matchAll(RUNTIME_DECLARATION_REGEX))
    addNames(groups?.module ?? "", [groups?.name ?? ""]);
  for (const { groups } of declarations.matchAll(TYPE_DECLARATION_REGEX))
    addNames(
      groups?.fromModule ?? groups?.importModule ?? "",
      (groups?.names ?? "").split(",").map((name) => name.trim()),
    );
  // A file the regexes read nothing from would leave the ban empty and silent, as a format the tool changes does
  ok(moduleNamesMap.size > 0, `${declarationsPath} declares no auto-import this ban can read.`);

  return Array.from(moduleNamesMap, ([name, importNames]) => ({
    allowTypeImports,
    importNames: importNames.filter(Boolean),
    message: `${source} auto-imports this, so it is never imported by hand — drop the import. The names are its generated \`${declarationsPath}\`.`,
    name,
  }));
};
// The app's imports are Nuxt's, written on `nuxt prepare` (the install's postinstall)
export const APP_RESTRICTED_IMPORT_PATHS: RestrictedImportPath[] = [
  ...RESTRICTED_IMPORT_PATHS,
  ...getAutoImportedPaths("apps/web/.nuxt/types/imports.d.ts", "Nuxt", false),
];
export const VUETIFY_IMPORT_PATH: RestrictedImportPath = { message: VUETIFY_MESSAGE, name: "@vuetify/v0" };
export const VUETIFY_IMPORT_PATTERN: RestrictedImportPattern = { group: ["@vuetify/v0/*"], message: VUETIFY_MESSAGE };
export const WORKSPACE_LIBRARY_IMPORT_PATTERN: RestrictedImportPattern = {
  allowTypeImports: true,
  group: ["@esposter/*", "agent-console-server", "azure-mock", "keyframe-store", "parse-tmx", "vue-phaserjs"],
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
