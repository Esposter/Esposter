import { PACKAGES_DIRECTORY } from "#src/services/package/new/constants";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { SCRIPTS_PACKAGE_NAME, WORKSPACE_PROTOCOL } from "#src/services/worktree/create/constants";

// The directories a worktree builds before its first command: every workspace package the scripts package depends on
// That has a build, since its commands load their `dist` at run time, read off its manifest so a dependency added there
// Is built with no list to keep, and each package named. A package named with no build task fails its build, which
// Names it, so it is not filtered out here. An app named is never built itself, since its build is the deploy's bundle:
// What it imports is every package's `dist`, so it builds the packages
export const readBuildDirectories = (worktreePath: string, packageNames: string[]): string[] => {
  const workspacePackages = readWorkspacePackages(worktreePath);
  const scriptsManifest = workspacePackages.find(({ manifest }) => manifest.name === SCRIPTS_PACKAGE_NAME)?.manifest;
  const runtimeNames = new Set(
    Object.entries({ ...scriptsManifest?.dependencies, ...scriptsManifest?.devDependencies })
      .filter(([, specifier]) => specifier.startsWith(WORKSPACE_PROTOCOL))
      .map(([name]) => name),
  );
  const runtimeDirectories = workspacePackages
    .filter(({ manifest }) => runtimeNames.has(manifest.name ?? "") && manifest.scripts?.build)
    .map(({ directory }) => directory);
  const namedDirectories = workspacePackages
    .filter(({ manifest }) => packageNames.some((name) => name === manifest.name))
    .map(({ directory, workspaceDirectory }) =>
      workspaceDirectory === PACKAGES_DIRECTORY ? directory : PACKAGES_DIRECTORY,
    );
  return [...new Set([...runtimeDirectories, ...namedDirectories])];
};
