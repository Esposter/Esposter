import type { InstalledManifest } from "#src/models/dependencies/score/InstalledManifest";

import {
  IMPLICIT_MODULE_SUFFIXES,
  MINIFIED_MARKER,
  MODULE_EXTENSIONS,
} from "#src/services/dependencies/score/constants";
import { isFile } from "#src/services/dependencies/score/isFile";
import { resolveEntryPath } from "#src/services/dependencies/score/resolveEntryPath";

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

// A relative import or require, as its specifier: a package's own files, never a dependency's
const RELATIVE_IMPORT_REGEX =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)["'](?<specifier>\.{1,2}\/[^"']+)["']/gu;

const isCountedModule = (file: string): boolean =>
  MODULE_EXTENSIONS.some((extension) => file.endsWith(extension)) && !file.includes(MINIFIED_MARKER);

// The file a relative specifier names once its implicit suffix is tried, or undefined when none exists
const resolveRelativeModule = (directory: string, specifier: string): string | undefined => {
  for (const suffix of IMPLICIT_MODULE_SUFFIXES) {
    const candidate = resolve(directory, `${specifier}${suffix}`);
    if (isFile(candidate)) return candidate;
  }
  return undefined;
};

const countSourceLines = (file: string, visited: Set<string>): number => {
  if (visited.has(file) || !isCountedModule(file) || !isFile(file)) return 0;
  visited.add(file);

  const source = readFileSync(file, "utf8");
  // Blank lines are left out, so a file's layout does not count as code
  let lines = source.split("\n").filter((line) => line.trim() !== "").length;
  for (const { groups } of source.matchAll(RELATIVE_IMPORT_REGEX)) {
    const target = resolveRelativeModule(dirname(file), groups?.specifier ?? "");
    if (target !== undefined) lines += countSourceLines(target, visited);
  }
  return lines;
};

// The lines of every module a package's runtime reaches from its entry, each file counted once: a package that ships
// CJS, ESM and UMD builds of one module is counted as the one module it is
export const countModuleGraphLines = (packageDirectory: string, manifest: InstalledManifest): number => {
  const entryPath = resolveEntryPath(manifest);
  if (entryPath === undefined) return 0;

  return countSourceLines(resolve(packageDirectory, entryPath), new Set());
};
