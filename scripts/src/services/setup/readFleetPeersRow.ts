import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { PEERS_FILE_PATH } from "#src/services/fleet/data/constants";
import { PEERS_NEXT } from "#src/services/setup/constants";
import { getStepRow } from "#src/services/setup/getStepRow";

// The peers a machine can transfer to and from, listed by name in a file no command writes
export const readFleetPeersRow = (environment: SetupEnvironment): SetupRow =>
  getStepRow("fleet peers", environment.exists(PEERS_FILE_PATH), `${PEERS_FILE_PATH}: ${PEERS_NEXT}`);
