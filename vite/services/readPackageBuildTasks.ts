import type { RunTask } from "#vite/models/RunTask";

import { BUILD_HOOK_GENERATED_PATTERNS, PACKAGE_REWRITTEN_PATTERNS, PACKAGES_DIRECTORY } from "#vite/constants";
import { createBuildCache } from "#vite/services/createBuildCache";
import { getBuildTaskName } from "#vite/services/getBuildTaskName";
import { readPackageBuildManifests } from "#vite/services/readPackageBuildManifests";

// Each package with a build script is a task of its own, run in its directory and ordered after the builds of the
// Workspace packages it depends on, so an edit rebuilds that package and the ones downstream while the rest replay
export const readPackageBuildTasks = (): [string, RunTask][] => {
  const buildManifests = readPackageBuildManifests();
  const buildTaskNameMap = new Map(
    buildManifests.map(({ directory, manifest }) => [manifest.name, getBuildTaskName(directory)]),
  );
  return buildManifests.map(({ directory, manifest }) => {
    const dependencyNames = [
      manifest.dependencies,
      manifest.devDependencies,
      manifest.optionalDependencies,
      manifest.peerDependencies,
    ].flatMap((dependencies) => Object.keys(dependencies ?? {}));
    return [
      getBuildTaskName(directory),
      {
        cache: createBuildCache(directory, [...PACKAGE_REWRITTEN_PATTERNS, ...BUILD_HOOK_GENERATED_PATTERNS]),
        command: "pnpm run build",
        cwd: `${PACKAGES_DIRECTORY}/${directory}`,
        dependsOn: dependencyNames.flatMap((dependencyName) => buildTaskNameMap.get(dependencyName) ?? []),
      },
    ];
  });
};
