import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { GAME_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { GAME_INSTALL_NEXT } from "#src/services/setup/constants";
import { getStepRow } from "#src/services/setup/getStepRow";
import { SetupStatus } from "#src/models/setup/SetupStatus";

// The game install is the one thing no command here makes, so a missing one is reported as the install's own status
export const readGameRow = (environment: SetupEnvironment): SetupRow => {
  const step = "game install";
  return environment.exists(GAME_DIRECTORY)
    ? getStepRow(step, true, "")
    : { next: GAME_INSTALL_NEXT, status: SetupStatus.Install, step };
};
