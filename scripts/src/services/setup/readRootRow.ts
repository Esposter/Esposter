import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { getStepRow } from "#src/services/setup/getStepRow";
import { getResult } from "@esposter/shared";

// A disk-only root the tooling writes into. It is created when missing, the one change the setup makes to a folder
export const readRootRow = (step: string, directory: string, environment: SetupEnvironment): SetupRow => {
  if (environment.exists(directory)) return getStepRow(step, true, "");
  return getResult(() => {
    environment.makeDirectory(directory);
  }).match(
    () => ({ next: directory, status: SetupStatus.Done, step }),
    (error) => ({ next: error.message, status: SetupStatus.NeedsYou, step }),
  );
};
