import { FILE_EXISTS_ERROR_CODE } from "#src/services/machine/constants";
import { getResult, noop } from "@esposter/shared";
import { linkSync, rmSync } from "node:fs";

// Puts a moved lock back under its path, unless another starter has created one there since it was moved
export const restoreLock = (movedPath: string, path: string): void => {
  getResult(() => {
    linkSync(movedPath, path);
  }).match(noop, (error) => {
    if (!("code" in error && error.code === FILE_EXISTS_ERROR_CODE)) throw error;
  });
  rmSync(movedPath, { force: true });
};
