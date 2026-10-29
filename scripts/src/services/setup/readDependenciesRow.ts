import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupOptions } from "#src/models/setup/SetupOptions";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { DEPENDENCIES_MARKER_PATH, PNPM_INSTALL_NEXT } from "#src/services/setup/constants";
import { getStepRow } from "#src/services/setup/getStepRow";
import { SetupStatus } from "#src/models/setup/SetupStatus";

// The dependencies are installed when pnpm's marker is in place. The install runs only when asked for, since it takes minutes
export const readDependenciesRow = (options: SetupOptions, environment: SetupEnvironment): SetupRow => {
  const step = "dependencies";
  if (environment.exists(DEPENDENCIES_MARKER_PATH)) return getStepRow(step, true, "");
  if (!options.install) return getStepRow(step, false, PNPM_INSTALL_NEXT);
  const { status } = environment.runVisibly(PNPM_FILE, [...PNPM_ARGS, "i"]);
  return status === 0
    ? { next: "", status: SetupStatus.Done, step }
    : getStepRow(step, false, "pnpm i failed: run pnpm i to read its error");
};
