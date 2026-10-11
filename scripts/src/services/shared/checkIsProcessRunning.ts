import { getResult } from "@esposter/shared";

// Signal 0 only asks whether the process exists
export const checkIsProcessRunning = (processId: number): boolean =>
  Number.isInteger(processId) &&
  processId > 0 &&
  getResult(() => process.kill(processId, 0)).match(
    () => true,
    () => false,
  );
