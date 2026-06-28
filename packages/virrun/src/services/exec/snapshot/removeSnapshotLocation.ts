import type { SnapshotLocation } from "@/models/exec/SnapshotLocation";

import { chmodSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
// Tears down a captured snapshot's on-disk tree - the teardown counterpart to createSnapshot's materialize.
// Capture is the only path that mounts an overlay with an on-disk workDir, and the kernel leaves that
// `work/work` scratch dir at mode 000 (owned by us, but un-traversable). Node's recursive rmSync refuses to
// Chmod before descending, so a plain remove EACCES-es on it. We restore +rwx top-down - a child becomes
// Reachable once its parent is traversable - then remove. Because this poison lives only inside snapshot
// Dirs, every other cache path stays an ordinary rmSync: callers never have to choose a "force" variant.
const makeTraversable = (dir: string): void => {
  chmodSync(dir, 0o700);
  for (const entry of readdirSync(dir, { withFileTypes: true }))
    if (entry.isDirectory()) makeTraversable(join(dir, entry.name));
};

export const removeSnapshotLocation = ({ dir }: SnapshotLocation): void => {
  if (existsSync(dir)) makeTraversable(dir);
  rmSync(dir, { force: true, recursive: true });
};
