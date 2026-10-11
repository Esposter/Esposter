import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { acquirePushLock } from "#src/queue/push/acquirePushLock";
import { PUSH_LOCK_PATH, PUSH_PENDING_PATH } from "#src/queue/push/constants";
import { markPushPending } from "#src/queue/push/markPushPending";
import { releasePushLock } from "#src/queue/push/releasePushLock";
import { takePushPending } from "#src/queue/push/takePushPending";
import { withFinalizerAsync } from "@esposter/shared";
import { existsSync } from "node:fs";

// Runs one push under the lock, shared by the post-commit hook and a manual call. A commit that lands while a push holds
// The lock only marks the pending mark, and the holder makes one more pass after it lets go when a mark is left. The mark
// Is written before the lock is tried again, so a holder that releases between the two cannot leave it unseen
export const runQueuePush = async (
  push: () => Promise<QueuePushOutcome>,
  lockPath: string = PUSH_LOCK_PATH,
  pendingPath: string = PUSH_PENDING_PATH,
): Promise<QueuePushOutcome> => {
  for (;;) {
    if (!acquirePushLock(lockPath)) {
      markPushPending(pendingPath);
      if (!acquirePushLock(lockPath)) return QueuePushOutcome.Queued;
    }

    // oxlint-disable-next-line no-await-in-loop -- one push at a time: a pending pass runs only after the push before it lets go
    const outcome = await withFinalizerAsync(
      () => {
        takePushPending(pendingPath);
        return push();
      },
      () => {
        releasePushLock(lockPath);
      },
    );

    if (!existsSync(pendingPath)) return outcome;
  }
};
