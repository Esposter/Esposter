import type { RunTasks } from "#vite/models/RunTasks";

import { PACKAGE_REWRITTEN_PATTERNS, PACKAGES_DIRECTORY } from "#vite/services/constants";
import { createBuildCache } from "#vite/services/createBuildCache";
import { getBuildTaskName } from "#vite/services/getBuildTaskName";
import { readPackageBuildTasks } from "#vite/services/readPackageBuildTasks";

const packageBuildTasks = readPackageBuildTasks();

export const BUILD_TASKS: RunTasks = {
  ...Object.fromEntries(packageBuildTasks),
  // The libraries as a set: the per-package tasks do the caching, so this one only orders them
  "build:packages": {
    cache: false,
    command: 'echo "every package built"',
    dependsOn: packageBuildTasks.map(([taskName]) => taskName),
  },
  // The parity page's production build, which `genshin:parity load` measures, cached as a package's is: a load run
  // Replays it while nothing the page reads has moved. The world package is built first, as the page imports it
  "build:parity": {
    cache: createBuildCache("genshin-world", PACKAGE_REWRITTEN_PATTERNS),
    command: "pnpm run build:parity",
    cwd: `${PACKAGES_DIRECTORY}/genshin-world`,
    dependsOn: [getBuildTaskName("genshin-world")],
  },
};
