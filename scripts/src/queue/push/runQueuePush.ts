import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { PUSH_LOCK_PATH, PUSH_PENDING_PATH } from "#src/queue/push/constants";
import { markPushPending } from "#src/queue/push/markPushPending";
import { takePushPending } from "#src/queue/push/takePushPending";
import { acquireProcessLock } from "#src/services/shared/acquireProcessLock";
import { releaseProcessLock } from "#src/services/shared/releaseProcessLock";
import { getResultAsync } from "@esposter/shared";
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
    if (!acquireProcessLock(lockPath)) {
      markPushPending(pendingPath);
      if (!acquireProcessLock(lockPath)) return QueuePushOutcome.Queued;
    }

    // oxlint-disable-next-line no-await-in-loop -- Each pass starts only once the one before it has pushed and let go of the lock
    const result = await getResultAsync(() => {
      takePushPending(pendingPath);
      return push();
    });
    // The lock is let go whether the push resolved or rejected, and a rejection is thrown on once it is
    releaseProcessLock(lockPath);
    const outcome = result.match(
      (value) => value,
      (error) => {
        throw error;
      },
    );

    if (!existsSync(pendingPath)) return outcome;
  }
};
