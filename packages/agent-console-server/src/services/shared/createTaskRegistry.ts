import type { TaskRegistry } from "#src/models/shared/TaskRegistry";
// The host's one fire-and-forget: work started from a sync callback — a socket message, a session's watch — is
// Held here until it ends, so closing the host waits for it instead of cutting it off
export const createTaskRegistry = (): TaskRegistry => {
  const pendingSet = new Set<Promise<void>>();
  return {
    drain: async () => {
      await Promise.all(pendingSet);
    },
    run: (task) => {
      // eslint-disable-next-line no-restricted-syntax -- deregisters this task from the set the shutdown drains, on both paths and without touching its outcome; a task never rejects
      const pending = task().finally(() => {
        pendingSet.delete(pending);
      });
      pendingSet.add(pending);
    },
  };
};
