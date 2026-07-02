import { renameSync, writeFileSync } from "node:fs";
// Atomic file write: write the payload to a pid-suffixed temp sibling, then rename it over the target. rename is
// Atomic within a single filesystem, so a reader — or a racing writer from another `virrun -- <cmd>` process — never
// Observes a half-written file, and two concurrent writers can't truncate each other's output. The temp sits in the
// Same directory as filePath so the rename stays intra-filesystem (a cross-device rename would fall back to a
// Non-atomic copy), and the pid suffix keeps concurrent writers from colliding on the temp name itself.
export const writeFileAtomicSync = (filePath: string, data: string): void => {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, data);
  renameSync(temporaryPath, filePath);
};
