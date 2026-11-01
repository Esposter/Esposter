import { EMPTY_LOCK_GRACE_MILLISECONDS } from "#src/services/machine/constants";
import { getResult } from "@esposter/shared";
import { statSync } from "node:fs";

// A lock with no process id yet is its writer's while it is fresh, since the writer writes its id in just after creating it
export const checkIsLockFresh = (path: string): boolean =>
  getResult(() => statSync(path).mtimeMs).match(
    (mtimeMilliseconds) => Date.now() - mtimeMilliseconds < EMPTY_LOCK_GRACE_MILLISECONDS,
    () => false,
  );
