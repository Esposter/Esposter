import type { QueueFile } from "#src/models/fleet/QueueFile";

import {
  PROPOSAL_DESIGN_FILE,
  PROPOSAL_METADATA_FILE,
  PROPOSAL_TASKS_FILE,
  PROPOSALS_DIRECTORY,
} from "#src/services/proposals/constants";
import { readWorkingTreeFiles } from "#src/services/shared/readWorkingTreeFiles";

// The changes' designs, task lists and metadata in the working tree, with the ones written and not yet added
export const readProposalFiles = (): QueueFile[] =>
  readWorkingTreeFiles(
    `${PROPOSALS_DIRECTORY}/*/${PROPOSAL_DESIGN_FILE}`,
    `${PROPOSALS_DIRECTORY}/*/${PROPOSAL_TASKS_FILE}`,
    `${PROPOSALS_DIRECTORY}/*/${PROPOSAL_METADATA_FILE}`,
  );
