import { checkIsProcessRunning } from "#src/services/shared/checkIsProcessRunning";

// Whether another live process holds the machine's watcher lock. The lock is released on exit, so a holder that is
// Gone is a claim to take over, and the session's own process id is never another watcher
export const checkIsWatching = (holderProcessId: number | undefined, ownProcessId: number): boolean =>
  holderProcessId !== undefined && holderProcessId !== ownProcessId && checkIsProcessRunning(holderProcessId);
