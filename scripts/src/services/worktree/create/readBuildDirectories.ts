import { PACKAGES_DIRECTORY } from "#src/services/package/new/constants";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { RUNTIME_PACKAGE_DIRECTORIES } from "#src/services/worktree/create/constants";

// The directories a worktree builds before its first command: the runtime set, and each package named. A package named
// With no build task fails its build, which names it, so it is not filtered out here. An app named is never built
// Itself, since its build is the deploy's bundle: what it imports is every package's `dist`, so it builds the packages
export const readBuildDirectories = (worktreePath: string, packageNames: string[]): string[] => {
  const namedDirectories = readWorkspacePackages(worktreePath)
    .filter(({ manifest }) => packageNames.some((name) => name === manifest.name))
    .map(({ directory, workspaceDirectory }) =>
      workspaceDirectory === PACKAGES_DIRECTORY ? directory : PACKAGES_DIRECTORY,
    );
  return [...new Set([...RUNTIME_PACKAGE_DIRECTORIES, ...namedDirectories])];
};
