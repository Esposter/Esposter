import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveAcceptanceCacheHome } from "@/services/exec/test/resolveAcceptanceCacheHome.test";
import { existsSync, rmSync } from "node:fs";
// Vitest global teardown for the heavy acceptance/equivalence suite: the warm dependency snapshot those tests share
// Is captured lazily by the first one that runs (ensureWarmSnapshot) into the single shared cache home, so no one
// File can own removing it — clean it once here, after every worker has finished. Setup is intentionally a no-op:
// Capturing here would force a full monorepo install onto every `vitest` invocation, including fast unit-only runs
// That never touch a snapshot, whereas lazy capture keeps that loop free. removeSnapshotDirectory restores the
// Overlay work dir's un-traversable scratch first so the subsequent rmSync of the cache home cannot EACCES; both are
// No-ops when no heavy test ran and the shared home was never created.
export default function setup(): () => void {
  return () => {
    const cacheHome = resolveAcceptanceCacheHome();
    if (!existsSync(cacheHome)) return;
    removeSnapshotDirectory(cacheHome);
    rmSync(cacheHome, { force: true, recursive: true });
  };
}
