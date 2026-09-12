import { REMOVE_LIST_REAP_MINIMUM_AGE_MS } from "#src/services/exec/util/constants";
import { VIRRUN_REMOVE_LIST_TEMP_PREFIX } from "#src/services/exec/wsl/constants";
import { reapStaleTempFiles } from "#src/services/exec/wsl/reapStaleTempFiles";
// Reclaims the staged remove-lists a previous run stranded in the WSL cache root. WSL_REMOVE_LIST_SCRIPT unlinks its
// Own list as its last act, so one only survives when the launch never ran (a wedged WSL service, where spawnBackground
// Discards the async failure) — and nothing else enumerates the cache root: every other sweep walks a named
// Subdirectory, and sweepStaleEntries skips non-directories outright. So the staging path reaps its predecessors,
// Which is also the only place that knows the naming.
//
// Owner-pid gated like every other temp reap, and age-gated on top of it: a live owner's list may still be about to be
// Read, and so may a just-dead owner's, because the teardown is spawned asynchronously and `wsl.exe` has to start the
// WSL relay and `sh` before the script's `< "$1"` redirect opens it — see REMOVE_LIST_REAP_MINIMUM_AGE_MS. Past that
// Floor the file is either open (an unlink on ext4 leaves the reader's fd intact) or was never going to be read at
// All. The worst case is re-derivation, not lost teardown: the dirs stay stale and the next sweep stages them again.
export const reapStaleRemoveLists = (dir: string): void => {
  reapStaleTempFiles(dir, [VIRRUN_REMOVE_LIST_TEMP_PREFIX], REMOVE_LIST_REAP_MINIMUM_AGE_MS);
};
