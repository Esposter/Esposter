import type { QueuedWrite } from "#src/models/shared/overlay/QueuedWrite";
import type { WriteQueue } from "#src/models/shared/overlay/WriteQueue";

import { checkDoTouchesOverlap } from "#src/services/shared/overlay/checkDoTouchesOverlap";
import { withFinalizerAsync } from "@esposter/shared";

// One queue per registry. A write waits for the earlier writes it overlaps, and writes on unrelated rows share no
// Key, so they run at once. The write is released when it settles, whether it failed or not
export const createWriteQueue = (): WriteQueue => {
  let queued: QueuedWrite[] = [];
  return (touches, run) => {
    const { promise: settled, resolve: release } = Promise.withResolvers<void>();
    const write: QueuedWrite = { settled, touches };
    const blockers = queued
      .filter((other) => checkDoTouchesOverlap(other.touches, touches))
      .map((other) => other.settled);
    queued = [...queued, write];
    return withFinalizerAsync(
      async () => {
        await Promise.all(blockers);
        await run();
      },
      () => {
        queued = queued.filter((other) => other !== write);
        release();
      },
    );
  };
};
