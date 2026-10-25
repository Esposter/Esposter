import type { QueueFile } from "#src/models/fleet/QueueFile";

import { PROPOSAL_DESIGN_FILE, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The changes' designs in the working tree, with the ones written and not yet added
export const readProposalFiles = (): QueueFile[] =>
  readSweepFilePaths(`${PROPOSALS_DIRECTORY}/*/${PROPOSAL_DESIGN_FILE}`).map((path) => ({
    path,
    text: readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"),
  }));
