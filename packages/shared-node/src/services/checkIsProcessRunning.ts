import { getResult } from "@esposter/shared";

// Signal 0 only asks whether the process exists: `ESRCH` is the one answer that says it does not, since `EPERM` names a
// Process that exists but this user may not signal
export const checkIsProcessRunning = (processId: number): boolean =>
  Number.isInteger(processId) &&
  processId > 0 &&
  getResult(() => process.kill(processId, 0)).match(
    () => true,
    (error) => !("code" in error) || error.code !== "ESRCH",
  );
