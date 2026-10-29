import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { SSH_DIRECTORY, SSH_KEY_NEXT, SSH_PUBLIC_KEY_NAMES } from "#src/services/setup/constants";
import { getStepRow } from "#src/services/setup/getStepRow";
import { join } from "node:path";

// A fleet peer is reached over SSH, so the machine needs a public key of its own that the peer holds
export const readSshKeyRow = (environment: SetupEnvironment): SetupRow =>
  getStepRow(
    "fleet SSH key",
    SSH_PUBLIC_KEY_NAMES.some((name) => environment.exists(join(SSH_DIRECTORY, name))),
    SSH_KEY_NEXT,
  );
