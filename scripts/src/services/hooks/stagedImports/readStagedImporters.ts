import type { StagedImporter } from "#src/models/hooks/StagedImporter";

import { findPackageDirectory } from "#src/services/hooks/stagedImports/findPackageDirectory";
import { getImportSpecifiers } from "#src/services/hooks/stagedImports/getImportSpecifiers";
import { getScriptBlocks } from "#src/services/hooks/stagedImports/getScriptBlocks";
import { readIndexBlobs } from "#src/services/hooks/stagedImports/readIndexBlobs";
import { runGitBytes } from "#src/services/hooks/stagedImports/runGitBytes";
import { jsonDateParse } from "@esposter/shared";
import { posix } from "node:path";

const IMPORTER_REGEX = /\.(?:ts|mts|vue)$/u;
const PACKAGE_JSON_FILENAME = "package.json";

// Every staged source file that can import, read from the index so a hunk staged for the commit is what is checked
export const readStagedImporters = (committedPaths: ReadonlySet<string>): StagedImporter[] => {
  const stagedPaths = runGitBytes(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"])
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
  const importerPaths = stagedPaths.filter((path) => IMPORTER_REGEX.test(path));
  if (importerPaths.length === 0) return [];

  const packageDirectories = new Map(importerPaths.map((path) => [path, findPackageDirectory(path, committedPaths)]));
  const packageJsonPaths = Array.from(new Set(packageDirectories.values()), (directory) =>
    directory === "" ? PACKAGE_JSON_FILENAME : posix.join(directory, PACKAGE_JSON_FILENAME),
  ).filter((path) => committedPaths.has(path));
  const blobs = readIndexBlobs([...importerPaths, ...packageJsonPaths]);

  return importerPaths.map((path) => {
    const packageDirectory = packageDirectories.get(path) ?? "";
    const packageJsonPath =
      packageDirectory === "" ? PACKAGE_JSON_FILENAME : posix.join(packageDirectory, PACKAGE_JSON_FILENAME);
    const packageJson = blobs.get(packageJsonPath);
    const source = blobs.get(path) ?? "";
    return {
      aliases:
        packageJson === undefined
          ? {}
          : (jsonDateParse<{ imports?: Record<string, unknown> }>(packageJson).imports ?? {}),
      packageDirectory,
      path,
      specifiers: getImportSpecifiers(path.endsWith(".vue") ? getScriptBlocks(source) : source),
    };
  });
};
