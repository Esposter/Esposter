import { checkIsNotFound } from "#src/services/shared/checkIsNotFound";
import { getResult } from "@esposter/shared";
import { renameSync } from "node:fs";

// Moves the lock aside, which is false when there was no lock at the path to move
export const checkIsLockMovedAside = (path: string, movedPath: string): boolean =>
  getResult(() => {
    renameSync(path, movedPath);
  }).match(
    () => true,
    (error) => {
      if (checkIsNotFound(error)) return false;
      throw error;
    },
  );
