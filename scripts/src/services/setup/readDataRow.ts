import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupOptions } from "#src/models/setup/SetupOptions";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { DATA_VERIFY_ARGS, DATA_VERIFY_COMMAND } from "#src/services/setup/constants";
import { getStepRow } from "#src/services/setup/getStepRow";
import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";

// The hosted game data's lock, checked against the public container only when asked: the check needs the network
export const readDataRow = (options: SetupOptions, environment: SetupEnvironment): SetupRow => {
  const step = "game data lock";
  if (!options.verify) return { next: `run with --verify, or ${DATA_VERIFY_COMMAND}`, status: SetupStatus.Info, step };
  const { status } = environment.runVisibly(PNPM_FILE, [...PNPM_ARGS, ...DATA_VERIFY_ARGS]);
  return getStepRow(step, status === 0, DATA_VERIFY_COMMAND);
};
