import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { getAcceptanceCacheHome } from "@/services/exec/test/getAcceptanceCacheHome";
import { existsSync, rmSync } from "node:fs";
// Cleans the warm snapshot the heavy acceptance/equivalence tests share. They capture it lazily (ensureWarmSnapshot)
// Into one cache home, so no single file can own removing it. Setup is a no-op: capturing here would force a full
// Monorepo install onto every `vitest` invocation including unit-only runs, whereas lazy capture keeps that loop
// Free. removeSnapshotDirectory restores the overlay work dir's un-traversable scratch so the rmSync cannot EACCES.
const acceptanceCacheHome = getAcceptanceCacheHome();

export default function setup(): () => void {
  return () => {
    if (!existsSync(acceptanceCacheHome)) return;
    removeSnapshotDirectory(acceptanceCacheHome);
    rmSync(acceptanceCacheHome, { force: true, recursive: true });
  };
}
