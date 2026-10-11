import type { PnpmProject } from "#src/models/dependencyGraph/PnpmProject";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";

// Every workspace project and its direct dependencies, as pnpm resolved them — pnpm is the one reader of the
// Workspace's edges, so a sibling is an edge exactly when pnpm links it
export const readPnpmProjects = (): PnpmProject[] => {
  const result = spawnSync("pnpm", ["ls", "-r", "--depth", "0", "--json"], { cwd: REPOSITORY_ROOT, encoding: "utf8" });
  if (result.status !== 0)
    throw new InvalidOperationError(Operation.Read, readPnpmProjects.name, "`pnpm ls -r --depth 0 --json` failed");

  return parseMachineJson<PnpmProject[]>(result.stdout);
};
