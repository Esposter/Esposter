import { checkIsCountedModule } from "#src/services/dependencies/score/checkIsCountedModule";
import { checkIsFile } from "#src/services/dependencies/score/checkIsFile";
import { resolveRelativeModule } from "#src/services/dependencies/score/resolveRelativeModule";
import { readFileSync } from "node:fs";
import { dirname } from "node:path";

// A relative import or require, as its specifier: a package's own files, never a dependency's
const RELATIVE_IMPORT_REGEX =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)["'](?<specifier>\.{1,2}\/[^"']+)["']/gu;

export const countSourceLines = (file: string, visited: Set<string>): number => {
  if (visited.has(file) || !checkIsCountedModule(file) || !checkIsFile(file)) return 0;
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
