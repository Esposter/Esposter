import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// A file is written beside its own name and renamed over it, so a reader never sees half of a write, and a run stopped
// Mid-write leaves its temporary file behind rather than a truncated file for every later run to fail on. The name
// Carries this process's id, so two runs ending together rename their own files rather than each other's
export const writeFileAtomically = (path: string, content: string): void => {
  const temporaryPath = `${path}.${process.pid}.tmp`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(temporaryPath, content);
  renameSync(temporaryPath, path);
};
