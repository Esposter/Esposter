import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { getAcceptanceCacheHome } from "@/services/exec/test/getAcceptanceCacheHome";
import { getResult, noop } from "@esposter/shared";
import { existsSync, rmSync } from "node:fs";
// Cleans the warm snapshot the heavy acceptance/equivalence tests share. They capture it lazily (ensureWarmSnapshot)
// Into one cache home, so no single file can own removing it. Setup is a no-op: capturing here would force a full
// Monorepo install onto every `vitest` invocation including unit-only runs, whereas lazy capture keeps that loop
// Free. removeSnapshotDirectory restores the overlay work dir's un-traversable scratch so the rmSync cannot EACCES.
const acceptanceCacheHome = getAcceptanceCacheHome();

export default function setup(): () => void {
  return () => {
    if (!existsSync(acceptanceCacheHome)) return;
    // Best-effort cache hygiene, never a test outcome. A concurrent heavy run (the acceptance home is one fixed path,
    // Shared across processes) can still hold an overlay mounted under it, so the chmod/rm here hits EROFS (read-only
    // Mount) or EACCES/EBUSY. That is the other run's to clean up on its own teardown — swallow it rather than crash
    // This run's close with an unhandled error after its tests already passed. The keyed-by-hash cache self-heals.
    getResult(() => {
      removeSnapshotDirectory(acceptanceCacheHome);
      rmSync(acceptanceCacheHome, { force: true, recursive: true });
    }).match(noop, noop);
  };
}
