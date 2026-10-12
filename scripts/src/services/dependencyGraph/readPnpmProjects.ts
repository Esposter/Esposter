import type { PnpmProject } from "#src/models/dependencyGraph/PnpmProject";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { spawnPnpm } from "#src/services/shared/spawnPnpm";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every workspace project and its direct dependencies, as pnpm resolved them — pnpm is the one reader of the
// Workspace's edges, so a sibling is an edge exactly when pnpm links it
export const readPnpmProjects = (): PnpmProject[] => {
  const result = spawnPnpm(["ls", "-r", "--depth", "0", "--json"], { cwd: REPOSITORY_ROOT });
  if (result.status !== 0)
    throw new InvalidOperationError(Operation.Read, readPnpmProjects.name, "`pnpm ls -r --depth 0 --json` failed");

  return parseMachineJson<PnpmProject[]>(result.stdout);
};
