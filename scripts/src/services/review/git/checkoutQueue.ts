import { QUEUE_BRANCH, REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";

// The checkout is `ai/queue`'s tip, so a merge, a fix or a settlement and its push start from the queue. It is forced and
// Cleaned, so nothing a settler before it left uncommitted or unlanded carries in. Ignored files, the builds among them,
// Stay.
export const checkoutQueue = (): void => {
  runGit(["checkout", "--force", "-B", QUEUE_BRANCH, REMOTE_QUEUE_REF]);
  runGit(["clean", "-d", "--force"]);
};
