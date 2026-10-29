import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { checkIsLongPathsEnabled } from "#src/services/setup/checkIsLongPathsEnabled";
import { LONG_PATHS_KEY, LONG_PATHS_NEXT, LONG_PATHS_VALUE_NAME } from "#src/services/setup/constants";
import { getStepRow } from "#src/services/setup/getStepRow";

// Long paths are off until someone enables them once, and a worktree's `node_modules` needs them
export const readLongPathsRow = (environment: SetupEnvironment): SetupRow => {
  const { stdout } = environment.run("reg", ["query", LONG_PATHS_KEY, "/v", LONG_PATHS_VALUE_NAME]);
  return getStepRow("long paths", checkIsLongPathsEnabled(stdout), LONG_PATHS_NEXT);
};
