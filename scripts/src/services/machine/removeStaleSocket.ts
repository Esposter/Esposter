import { rmSync } from "node:fs";

// Removes the socket file a dead holder left, which only a starter holding the takeover socket may do. A Windows pipe
// Leaves no file behind, so there is none to remove there
export const removeStaleSocket = (path: string): void => {
  if (process.platform !== "win32") rmSync(path, { force: true });
};
