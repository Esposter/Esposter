import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import {
  ANIMESTUDIO_CLI_ENVIRONMENT_VARIABLE,
  ANIMESTUDIO_CLI_PATH,
} from "#src/services/genshinAssets/shared/constants";
import { getStepRow } from "#src/services/setup/getStepRow";

// AnimeStudio has no Windows build or fetch command, so the CLI is unpacked by hand and found at this path
export const readAnimeStudioRow = (environment: SetupEnvironment): SetupRow =>
  getStepRow(
    "AnimeStudio CLI",
    environment.exists(ANIMESTUDIO_CLI_PATH),
    `unpack the Windows AnimeStudio command line to ${ANIMESTUDIO_CLI_PATH}, or set ${ANIMESTUDIO_CLI_ENVIRONMENT_VARIABLE} to where it is`,
  );
