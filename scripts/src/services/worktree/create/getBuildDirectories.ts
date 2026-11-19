import type { WorkspacePackage } from "#src/models/shared/WorkspacePackage";

import { APPS_DIRECTORY, PACKAGES_DIRECTORY } from "#src/services/package/new/constants";
import { SCRIPTS_PACKAGE_NAME, WORKSPACE_PROTOCOL } from "#src/services/worktree/create/constants";

// The directories a worktree builds before its first command, in dependency order: every workspace package the scripts
// Package depends on, and every package named, each walked through the workspace packages it depends on, transitively, so
// A package with no build of its own is walked through to the builds beneath it. The walk reads the four dependency
// Fields a build is ordered by, and only the `workspace:` specifiers. A package with a build script is built, and so is
// Each package named, since a named one with no build task fails its build, which names it. An app named is never built
// Itself, since its build is the deploy's bundle: what it imports is every package's `dist`, so it stands for them all
export const getBuildDirectories = (workspacePackages: WorkspacePackage[], packageNames: string[]): string[] => {
  const workspacePackageMap = new Map(
    workspacePackages.flatMap((workspacePackage) =>
      workspacePackage.manifest.name === undefined ? [] : [[workspacePackage.manifest.name, workspacePackage] as const],
    ),
  );
  const namedPackages = workspacePackages.filter(({ manifest }) => packageNames.some((name) => name === manifest.name));
  const namedLibraries = namedPackages.filter(({ workspaceDirectory }) => workspaceDirectory === PACKAGES_DIRECTORY);
  const visited = new Set<WorkspacePackage>();
  // Listed after every package it depends on, so the directories read off this list are in the order a build needs them
  const dependencyOrder: WorkspacePackage[] = [];
  const visit = (workspacePackage: WorkspacePackage): void => {
    if (visited.has(workspacePackage)) return;
    visited.add(workspacePackage);
    const { dependencies, devDependencies, optionalDependencies, peerDependencies } = workspacePackage.manifest;
    for (const [name, specifier] of [dependencies, devDependencies, optionalDependencies, peerDependencies].flatMap(
      (fields) => Object.entries(fields ?? {}),
    )) {
      const dependency = workspacePackageMap.get(name);
      if (dependency !== undefined && specifier.startsWith(WORKSPACE_PROTOCOL)) visit(dependency);
    }
    dependencyOrder.push(workspacePackage);
  };
  const scriptsPackage = workspacePackages.find(({ manifest }) => manifest.name === SCRIPTS_PACKAGE_NAME);
  if (scriptsPackage !== undefined) visit(scriptsPackage);
  for (const namedLibrary of namedLibraries) visit(namedLibrary);

  // A member at the repository root, the scripts package, has no build of its own, so only the packages directory counts
  const directories = dependencyOrder.flatMap((workspacePackage) => {
    const { directory, manifest, workspaceDirectory } = workspacePackage;
    const isBuilt = manifest.scripts?.build !== undefined || namedLibraries.includes(workspacePackage);
    return workspaceDirectory === PACKAGES_DIRECTORY && isBuilt ? [directory] : [];
  });
  const namesApp = namedPackages.some(({ workspaceDirectory }) => workspaceDirectory === APPS_DIRECTORY);
  return namesApp ? [...directories, PACKAGES_DIRECTORY] : directories;
};
