import { checkIsNotFound } from "#src/services/shared/checkIsNotFound";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";

// An empty lock has no process id yet, and `Number("")` would read it as process 0, so it is undefined here. A lock that
// Cannot be read is an error: undefined would send its holder to the freshness check, which can take a live claim over
export const readLockProcessId = (path: string): number | undefined =>
  getResult(() => readFileSync(path, "utf8")).match(
    (text) => (text.length > 0 && Number.isInteger(Number(text)) ? Number(text) : undefined),
    (error) => {
      if (!checkIsNotFound(error)) throw error;
      return undefined;
    },
  );
