import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";

// An empty lock has no process id yet, and `Number("")` would read it as process 0, so it is undefined here
export const readLockProcessId = (path: string): number | undefined =>
  getResult(() => readFileSync(path, "utf8")).match(
    (text) => (text.length > 0 && Number.isInteger(Number(text)) ? Number(text) : undefined),
    () => undefined,
  );
