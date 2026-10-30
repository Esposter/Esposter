import type { SetupRow } from "#src/models/setup/SetupRow";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { OODLE_HELPER_PATCH_PATH } from "#src/services/recreation/animeStudio/constants";

// The Oodle hook the CLI needs is a committed patch, which no command applies to an unpacked build, so it is only reported
export const readOodlePatchRow = (): SetupRow => ({
  next: `the hook the CLI needs is the committed patch at ${OODLE_HELPER_PATCH_PATH}; check the unpacked build carries it`,
  status: SetupStatus.Info,
  step: "AnimeStudio Oodle hook",
});
