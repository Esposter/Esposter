import { PARITY_BUILD_DIRECTORY, PARITY_BUILD_TASK } from "#src/services/genshinParity/load/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { spawnPnpm } from "#src/services/shared/spawnPnpm";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Builds the parity page for production into its folder in the world package, through the root `vite.config.ts`'s
// Task, whose cache replays the build while nothing the page reads has moved
export const buildParityPage = (): void => {
  const { status } = spawnPnpm(["exec", "vp", "run", PARITY_BUILD_TASK], { cwd: REPOSITORY_ROOT, stdio: "inherit" });
  if (status !== 0)
    throw new InvalidOperationError(Operation.Create, PARITY_BUILD_DIRECTORY, `its build exited with ${status}`);
};
