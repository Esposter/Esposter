import { tryCreateLock } from "#src/queue/push/tryCreateLock";
import { checkIsProcessRunning } from "#src/services/shared/checkIsProcessRunning";
import { getResult } from "@esposter/shared";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname } from "node:path";

// Takes the push lock for this process, or returns False while a live process holds it. A lock whose process is gone was
// Left by a push that died, so it is removed and taken once more. An empty lock is one whose holder is still writing it
export const acquirePushLock = (lockPath: string): boolean => {
  mkdirSync(dirname(lockPath), { recursive: true });
  if (tryCreateLock(lockPath)) return true;
  const holder = getResult(() => readFileSync(lockPath, "utf8")).match(
    (text) => text,
    () => "",
  );
  if (holder === "" || checkIsProcessRunning(Number(holder))) return false;
  rmSync(lockPath, { force: true });
  return tryCreateLock(lockPath);
};
