import { isProcessAlive } from "@/services/exec/util/isProcessAlive";
import { parseTempOwnerPid } from "@/services/exec/util/parseTempOwnerPid";
import { VIRRUN_REMOVE_LIST_TEMP_PREFIX } from "@/services/exec/wsl/constants";
import { getResult, noop } from "@esposter/shared";
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
// Reclaims the staged remove-lists a previous run stranded in the WSL cache root. WSL_REMOVE_LIST_SCRIPT unlinks its
// Own list as its last act, so one only survives when the launch never ran (a wedged WSL service, where spawnBackground
// Discards the async failure) — and nothing else enumerates the cache root: every other sweep walks a named
// Subdirectory, and sweepStaleEntries skips non-directories outright. So the staging path reaps its predecessors,
// Which is also the only place that knows the naming.
//
// Owner-pid gated exactly like reapStaleTemps: a live owner's list may still be about to be read. A dead owner's
// Cannot be — the spawn is synchronous, so by then the script has the file open, and an unlink on ext4 leaves the
// Reader's fd intact. The worst case is re-derivation, not lost teardown: the dirs stay stale and the next sweep
// Stages them again.
export const reapStaleRemoveLists = (dir: string): void => {
  for (const entry of getResult(() => readdirSync(dir, { withFileTypes: true })).unwrapOr([])) {
    if (!entry.isFile()) continue;

    const pid = parseTempOwnerPid(entry.name, [VIRRUN_REMOVE_LIST_TEMP_PREFIX]);
    if (pid === undefined || isProcessAlive(pid)) continue;

    getResult(() => {
      rmSync(join(dir, entry.name), { force: true });
    }).match(noop, noop);
  }
};
