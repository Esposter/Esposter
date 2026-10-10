import { readLockfileImporter, readLockfileLines } from "#src/services/buildCache/readLockfileImporter";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { relative, resolve, sep } from "node:path";

// The directories of the workspace packages a package links, as its lockfile importer names them, so a build can bring
// Each one up to date before its own key is computed
export const readWorkspaceDependencyDirectories = (
  packageDirectory: string,
  repositoryRoot: string = REPOSITORY_ROOT,
): string[] => {
  const importer = readLockfileImporter(
    readLockfileLines(repositoryRoot),
    relative(repositoryRoot, packageDirectory).split(sep).join("/"),
  );
  return importer.linkDependencies.map(({ path }) => resolve(packageDirectory, path));
};
