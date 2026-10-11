import { existsSync, rmSync } from "node:fs";

// Clears the mark and returns whether one was set, so a push pass starts clean and knows whether to run again
export const takePushPending = (pendingPath: string): boolean => {
  const isPending = existsSync(pendingPath);
  rmSync(pendingPath, { force: true });
  return isPending;
};
