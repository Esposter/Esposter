import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Records that a commit landed while a push ran, so the running push makes one more pass before it lets go
export const markPushPending = (pendingPath: string): void => {
  mkdirSync(dirname(pendingPath), { recursive: true });
  writeFileSync(pendingPath, "");
};
