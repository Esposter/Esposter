import type { PnpmProject } from "#src/models/dependencyGraph/PnpmProject";

import { CHILD_PROCESS_TIMEOUT_MS, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { spawnPnpm } from "#src/services/shared/spawnPnpm";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every workspace project and its direct dependencies, as the committed lockfile links them. pnpm is the one reader of
// The workspace's edges, so a sibling is an edge exactly when the lockfile links it. Read from the lockfile rather than
// `node_modules`, since a pull replays the queue's manifests onto the checkout without installing them, so the
// Installed state lags the tree the land pushes. `ai:land` waits on it through the precheck, so a stalled one is killed
// Past the bound and the call throws
export const readPnpmProjects = (): PnpmProject[] => {
  const result = spawnPnpm(["ls", "-r", "--depth", "0", "--json", "--lockfile-only"], {
    cwd: REPOSITORY_ROOT,
    timeout: CHILD_PROCESS_TIMEOUT_MS,
  });
  if (result.status !== 0)
    throw new InvalidOperationError(
      Operation.Read,
      readPnpmProjects.name,
      "`pnpm ls -r --depth 0 --json --lockfile-only` failed",
    );

  return parseMachineJson<PnpmProject[]>(result.stdout);
};
