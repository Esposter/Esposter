import type { TaskRegistry } from "#src/models/shared/TaskRegistry";

import { withFinalizerAsync } from "@esposter/shared";

// The host's one fire-and-forget: work started from a sync callback — a socket message, a session's watch — is
// Held here until it ends, so closing the host waits for it instead of cutting it off
export const createTaskRegistry = (): TaskRegistry => {
  const pendingSet = new Set<Promise<void>>();
  return {
    drain: async () => {
      await Promise.all(pendingSet);
    },
    run: (task) => {
      const pending = withFinalizerAsync(task, () => {
        pendingSet.delete(pending);
      });
      pendingSet.add(pending);
    },
  };
};
