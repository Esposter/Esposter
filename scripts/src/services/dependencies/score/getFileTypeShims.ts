import { getCalledPackageNames } from "#src/services/dependencies/score/getCalledPackageNames";
import { getImportedPackageName } from "#src/services/dependencies/score/getImportedPackageName";
import { getNearbyPackageNames } from "#src/services/dependencies/score/getNearbyPackageNames";
import { readImportLines } from "#src/services/dependencies/score/readImportLines";

const DECLARE_MODULE_REGEX = /^\s*declare module "(?<specifier>[^"]+)"/u;
const EXPECT_ERROR = "@ts-expect-error";
const UNKNOWN_CAST = "as unknown as";

// The type workarounds a file holds, counted per package: each module declared over one, and each directive or cast that
// Sits beside one of its imports or calls. A line counts once per package it touches.
export const getFileTypeShims = (text: string): Map<string, number> => {
  const lines = text.split("\n");
  const importLines = readImportLines(lines);
  const packageNameCountMap = new Map<string, number>();
  const countShim = (packageName: string): void => {
    packageNameCountMap.set(packageName, (packageNameCountMap.get(packageName) ?? 0) + 1);
  };
  const countShims = (packageNames: Set<string>): void => {
    for (const packageName of packageNames) countShim(packageName);
  };

  for (const [index, line] of lines.entries()) {
    const declaredSpecifier = DECLARE_MODULE_REGEX.exec(line)?.groups?.specifier;
    if (declaredSpecifier !== undefined) countShim(getImportedPackageName(declaredSpecifier));
    if (line.includes(EXPECT_ERROR)) countShims(getNearbyPackageNames(importLines, index));
    if (line.includes(UNKNOWN_CAST)) countShims(getCalledPackageNames(lines, importLines, index));
  }

  return packageNameCountMap;
};
