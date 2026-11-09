import type { RunTask } from "#vite/models/RunTask";

import {
  BUILD_HOOK_GENERATED_PATTERNS,
  PACKAGE_REWRITTEN_PATTERNS,
  PACKAGES_DIRECTORY,
  PNPM_STATE_PATTERNS,
} from "#vite/constants";
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
        cache: {
          input: [
            { auto: true },
            ...PNPM_STATE_PATTERNS,
            // Resolved from the workspace root, as the task belongs to it rather than to the package its `cwd` names
            ...[...PACKAGE_REWRITTEN_PATTERNS, ...BUILD_HOOK_GENERATED_PATTERNS].map((pattern) => ({
              base: "workspace" as const,
              pattern: `!${PACKAGES_DIRECTORY}/${directory}/${pattern}`,
            })),
          ],
          output: [{ auto: true }, ...PNPM_STATE_PATTERNS],
        },
        command: "pnpm run build",
        cwd: `${PACKAGES_DIRECTORY}/${directory}`,
        dependsOn: dependencyNames.flatMap((dependencyName) => buildTaskNameMap.get(dependencyName) ?? []),
      },
    ];
  });
};
