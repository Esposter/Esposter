import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { checkIsProcessAlive } from "#src/services/exec/util/checkIsProcessAlive";
import { REMOVE_LIST_REAP_MINIMUM_AGE_MS } from "#src/services/exec/util/constants";
import { parseTempOwnerPid } from "#src/services/exec/util/parseTempOwnerPid";
import { VIRRUN_REMOVE_LIST_TEMP_PREFIX } from "#src/services/exec/wsl/constants";
import { getResult, noop } from "@esposter/shared";
import { readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
// Reclaims the staged remove-lists a previous run stranded in the WSL cache root. WSL_REMOVE_LIST_SCRIPT unlinks its
// Own list as its last act, so one only survives when the launch never ran (a wedged WSL service, where spawnBackground
// Discards the async failure) — and nothing else enumerates the cache root: every other sweep walks a named
// Subdirectory, and sweepStaleEntries skips non-directories outright. So the staging path reaps its predecessors,
// Which is also the only place that knows the naming.
//
// Owner-pid gated like reapStaleTemps, and age-gated on top of it: a live owner's list may still be about to be read,
// And so may a just-dead owner's, because the teardown is spawned asynchronously and `wsl.exe` has to start the WSL
// Relay and `sh` before the script's `< "$1"` redirect opens it — see REMOVE_LIST_REAP_MINIMUM_AGE_MS. Past that floor
// The file is either open (an unlink on ext4 leaves the reader's fd intact) or was never going to be read at all. The
// Worst case is re-derivation, not lost teardown: the dirs stay stale and the next sweep stages them again.
export const reapStaleRemoveLists = (dir: string): void => {
  const reapableBeforeMs = Date.now() - REMOVE_LIST_REAP_MINIMUM_AGE_MS;
  for (const entry of getResult(() => readdirSync(dir, { withFileTypes: true })).unwrapOr([])) {
    if (!entry.isFile()) continue;

    const pid = parseTempOwnerPid(entry.name, [VIRRUN_REMOVE_LIST_TEMP_PREFIX]);
    if (pid === undefined || checkIsProcessAlive(pid)) continue;

    const mtimeMs = getResult(() => statSync(join(dir, entry.name)).mtimeMs).unwrapOr(undefined);
    if (mtimeMs === undefined || mtimeMs > reapableBeforeMs) continue;

    getResult(() => {
      rmSync(join(dir, entry.name), { force: true });
    }).match(noop, ({ message }) => {
      writeVirrunDebug(`stranded remove list ${entry.name} not reaped — ${message}`);
    });
  }
};
