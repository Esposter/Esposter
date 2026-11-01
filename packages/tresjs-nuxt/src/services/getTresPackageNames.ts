import { CORE_PACKAGE_NAME, TRES_PACKAGE_SCOPE } from "#src/services/constants";
import { getDependencyNames } from "#src/services/getDependencyNames";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

// The app's own manifest and the one above it when the app sits in a monorepo, where a @tresjs package is often installed
export const getTresPackageNames = async (rootDirectory: string): Promise<string[]> => {
  const parentDirectory = dirname(rootDirectory);
  const directories = existsSync(join(parentDirectory, "package.json"))
    ? [rootDirectory, parentDirectory]
    : [rootDirectory];
  const dependencyNames = (await Promise.all(directories.map((directory) => getDependencyNames(directory)))).flat();
  return [...new Set(dependencyNames)].filter(
    (dependencyName) => dependencyName.startsWith(TRES_PACKAGE_SCOPE) && dependencyName !== CORE_PACKAGE_NAME,
  );
};
