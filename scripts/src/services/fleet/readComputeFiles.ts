import type { QueueFile } from "#src/models/fleet/QueueFile";

import {
  COMPUTE_QUEUE_DIRECTORY,
  COMPUTE_QUEUE_INDEX_FILE,
  COMPUTE_QUEUE_PAGE_FILE,
} from "#src/services/fleet/constants";
import { readWorkingTreeFiles } from "#src/services/shared/readWorkingTreeFiles";

// The compute index and every area's design in the working tree, as the report reads them. The fleet reads origin's
// Queue branch instead, through `readQueueFiles`, so the two can differ by a commit the checkout has not pulled
export const readComputeFiles = (): QueueFile[] =>
  readWorkingTreeFiles(
    `${COMPUTE_QUEUE_DIRECTORY}/*/${COMPUTE_QUEUE_PAGE_FILE}`,
    `${COMPUTE_QUEUE_DIRECTORY}/${COMPUTE_QUEUE_INDEX_FILE}`,
  );
