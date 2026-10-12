import { QUEUE_BRANCH, REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";

// The checkout is `ai/queue`'s tip, so a merge, a fix or a settlement and its push start from the queue
export const checkoutQueue = (): void => {
  runGit(["checkout", "-B", QUEUE_BRANCH, REMOTE_QUEUE_REF]);
};
