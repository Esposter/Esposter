import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { reapStaleTemps } from "#src/services/exec/snapshot/reapStaleTemps";
import { removeSnapshotDirectory } from "#src/services/exec/snapshot/removeSnapshotDirectory";
import { getAcceptanceCacheHome } from "#src/services/exec/test/getAcceptanceCacheHome";
import { getHomeCacheDirectory } from "#src/services/exec/test/getHomeCacheDirectory";
import { VIRRUN_TEMP_DIR_PREFIX } from "#src/services/exec/util/constants";
import { getResult, noop } from "@esposter/shared";
import { existsSync, rmSync } from "node:fs";

// Setup reclaims the home-cache temp directories (corpora, clean checkouts) a killed run stranded — a checkout carries
// Its own warm store, so each corpse is gigabytes. Only a dead owner's are taken, so a concurrent run keeps its own.
// The teardown cleans the warm snapshot the heavy acceptance/equivalence tests share. They capture it lazily
// (ensureWarmSnapshot) into one cache home, so no single file can own removing it, and capturing here instead would
// Force a full monorepo install onto every `vitest` invocation including unit-only runs. removeSnapshotDirectory
// Restores the overlay work directory's un-traversable scratch so the rmSync cannot EACCES. The home is resolved at
// Teardown and inside the guard, because on win32 it is asked of WSL: a VM that will not start must not fail a
// Unit-only run that never touched it.
export default function setup(): () => void {
  reapStaleTemps(getHomeCacheDirectory(), [VIRRUN_TEMP_DIR_PREFIX]);
  return () => {
    // Best-effort cache hygiene, never a test outcome. A concurrent heavy run (the acceptance home is one fixed path,
    // Shared across processes) can still hold an overlay mounted under it, so the chmod/rm here hits EROFS (read-only
    // Mount) or EACCES/EBUSY. That is the other run's to clean up on its own teardown — trace it rather than crash
    // This run's close with an unhandled error after its tests already passed. The keyed-by-hash cache self-heals.
    getResult(() => {
      const acceptanceCacheHome = getAcceptanceCacheHome();
      if (!existsSync(acceptanceCacheHome)) return;
      removeSnapshotDirectory(acceptanceCacheHome);
      rmSync(acceptanceCacheHome, { force: true, recursive: true });
    }).match(noop, (error) => {
      writeVirrunDebug(`acceptance cache removal skipped, the next heavy run re-captures — ${error.message}`);
    });
  };
}
