import { FILE_EXISTS_ERROR_CODE } from "#src/services/machine/constants";
import { getResult } from "@esposter/shared";
import { writeFileSync } from "node:fs";

// Create-only, so of two starters exactly one gets the file, however close together they start
export const checkIsLockCreated = (path: string): boolean =>
  getResult(() => {
    writeFileSync(path, `${process.pid}`, { flag: "wx" });
  }).match(
    () => true,
    (error) => {
      if ("code" in error && error.code === FILE_EXISTS_ERROR_CODE) return false;
      throw error;
    },
  );
