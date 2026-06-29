import { chmodSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
// Recursively removes a snapshot directory (a capture temp or a whole `<hash>` root). The single teardown
// Primitive for the snapshot tree — use it for any snapshot dir, plain rmSync for everything else. It exists
// Because a capture run mounts an overlay whose on-disk workDir the kernel leaves with a `work/work` scratch
// At mode 000 (owned by us, but un-traversable); Node's recursive rmSync refuses to chmod before descending,
// So a plain remove EACCES-es on it. We restore +rwx top-down — a child becomes reachable once its parent is
// Traversable — then remove. Harmless on an ordinary tree (a published `upper` carries no poison), so callers
// Never have to pick a "force" variant or reason about whether a given snapshot dir is poisoned.
const makeTraversable = (dir: string): void => {
  chmodSync(dir, 0o700);
  for (const entry of readdirSync(dir, { withFileTypes: true }))
    if (entry.isDirectory()) makeTraversable(join(dir, entry.name));
};

export const removeSnapshotDirectory = (dir: string): void => {
  if (existsSync(dir)) makeTraversable(dir);
  rmSync(dir, { force: true, recursive: true });
};
