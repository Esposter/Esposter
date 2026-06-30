import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { HOME_CACHE_DIRECTORY_NAME, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { existsSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
// Cleans the warm snapshot the heavy acceptance/equivalence tests share. They capture it lazily (ensureWarmSnapshot)
// Into one cache home, so no single file can own removing it. Setup is a no-op: capturing here would force a full
// Monorepo install onto every `vitest` invocation including unit-only runs, whereas lazy capture keeps that loop
// Free. removeSnapshotDirectory restores the overlay work dir's un-traversable scratch so the rmSync cannot EACCES.
// The path mirrors resolveAcceptanceCacheHome (shared leaf constants) — recomputed rather than imported because this
// File runs in a non-test context that cannot load a `.test.ts` (its top-level describe.todo would throw).
const acceptanceCacheHome = join(homedir(), HOME_CACHE_DIRECTORY_NAME, `${VIRRUN_TEMP_DIR_PREFIX}acceptance`);

export default function setup(): () => void {
  return () => {
    if (!existsSync(acceptanceCacheHome)) return;
    removeSnapshotDirectory(acceptanceCacheHome);
    rmSync(acceptanceCacheHome, { force: true, recursive: true });
  };
}
