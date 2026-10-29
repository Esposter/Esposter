import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { CORE_SYMLINKS_KEY, SYMLINKS_ENABLED_VALUE, SYMLINKS_NEXT } from "#src/services/setup/constants";
import { getStepRow } from "#src/services/setup/getStepRow";

// Git on Windows defaults `core.symlinks` to false, which turns a fresh clone's `.claude` alias into a text file
export const readSymlinksRow = (environment: SetupEnvironment): SetupRow => {
  const { status, stdout } = environment.run("git", ["config", "--get", CORE_SYMLINKS_KEY]);
  return getStepRow("git symlinks", status === 0 && stdout?.trim() === SYMLINKS_ENABLED_VALUE, SYMLINKS_NEXT);
};
