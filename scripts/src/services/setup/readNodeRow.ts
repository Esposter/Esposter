import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getStepRow } from "#src/services/setup/getStepRow";
import { checkIsNodeVersionMatch } from "#src/services/setup/checkIsNodeVersionMatch";
import { VP_ENV_INSTALL_NEXT } from "#src/services/setup/constants";
import { NODE_VERSION_FILENAME } from "#src/services/updateNode/constants";
import { join } from "node:path";

// The node running this command against the one `.node-version` pins
export const readNodeRow = (environment: SetupEnvironment): SetupRow => {
  const pinned = environment.readText(join(REPOSITORY_ROOT, NODE_VERSION_FILENAME)) ?? "";
  return getStepRow("node", checkIsNodeVersionMatch(process.version, pinned), VP_ENV_INSTALL_NEXT);
};
