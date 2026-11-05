import type { QueueFile } from "#src/models/fleet/QueueFile";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The files under the pathspecs as the working tree holds them, the ones written and not yet added included
export const readWorkingTreeFiles = (...pathspecs: string[]): QueueFile[] =>
  readSweepFilePaths(...pathspecs).map((path) => ({
    path,
    text: readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"),
  }));
