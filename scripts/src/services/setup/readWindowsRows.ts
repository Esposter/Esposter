import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { readAnimeStudioRow } from "#src/services/setup/readAnimeStudioRow";
import { readFleetPeersRow } from "#src/services/setup/readFleetPeersRow";
import { readFleetProfileRow } from "#src/services/setup/readFleetProfileRow";
import { readLongPathsRow } from "#src/services/setup/readLongPathsRow";
import { readOodlePatchRow } from "#src/services/setup/readOodlePatchRow";
import { readSshKeyRow } from "#src/services/setup/readSshKeyRow";
import { readSymlinksRow } from "#src/services/setup/readSymlinksRow";

// The facts only a Windows machine needs, read on Windows and nowhere else. Each is in place or printed with what to do
export const readWindowsRows = (environment: SetupEnvironment, platform: NodeJS.Platform): SetupRow[] =>
  platform === "win32"
    ? [
        readSymlinksRow(environment),
        readLongPathsRow(environment),
        readAnimeStudioRow(environment),
        readOodlePatchRow(),
        readSshKeyRow(environment),
        readFleetProfileRow(environment),
        readFleetPeersRow(environment),
      ]
    : [];
