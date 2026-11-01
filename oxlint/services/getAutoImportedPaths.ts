import { ok } from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import type { RestrictedImportPath } from "../models/RestrictedImportPath.ts";

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
  const declarationsUrl = new URL(`../../${declarationsPath}`, import.meta.url);
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
