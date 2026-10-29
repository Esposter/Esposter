import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// A cache is written to a file beside its own name and renamed over it, so a reader never sees half of a write, and a
// Run stopped mid-write leaves its temporary file behind rather than a truncated cache for every later run to fail on
export const writeCacheFile = (path: string, content: string): void => {
  const temporaryPath = `${path}.${process.pid}.tmp`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(temporaryPath, content);
  renameSync(temporaryPath, path);
};
