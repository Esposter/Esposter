import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { checkIsDevDrive } from "#src/services/setup/checkIsDevDrive";
import { DEV_DRIVE_NEXT } from "#src/services/setup/constants";
import { getStepRow } from "#src/services/setup/getStepRow";

// Every checkout links its packages from the pnpm store's global virtual store, so the store's volume carries each
// Install and each worktree's reads, which a Dev Drive serves without Defender scanning them in line
export const readDevDriveRow = (environment: SetupEnvironment): SetupRow => {
  const storePath = environment.run("pnpm", ["store", "path"]).stdout?.trim() ?? "";
  const drive = storePath.slice(0, 2);
  const { stdout } = environment.run("fsutil", ["devdrv", "query", drive]);
  return getStepRow("dev drive", checkIsDevDrive(stdout), DEV_DRIVE_NEXT);
};
