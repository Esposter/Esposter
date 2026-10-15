import type { PackageManifest } from "#src/models/PackageManifest";

import { CORE_PACKAGE_NAME, TRES_PACKAGE_SCOPE } from "#src/services/constants";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const getDependencyNames = async (directory: string): Promise<string[]> => {
  const manifest: PackageManifest = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
  return [...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})];
};

// The app's own manifest and the one above it when the app sits in a monorepo, where a @tresjs package is often installed
export const getTresPackageNames = async (rootDirectory: string): Promise<string[]> => {
  const parentDirectory = dirname(rootDirectory);
  const directories = existsSync(join(parentDirectory, "package.json"))
    ? [rootDirectory, parentDirectory]
    : [rootDirectory];
  const dependencyNames = (await Promise.all(directories.map(getDependencyNames))).flat();
  return [...new Set(dependencyNames)].filter(
    (dependencyName) => dependencyName.startsWith(TRES_PACKAGE_SCOPE) && dependencyName !== CORE_PACKAGE_NAME,
  );
};
