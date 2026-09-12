import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { checkIsOwnerAlive } from "#src/services/exec/util/checkIsOwnerAlive";
import { WSL_WORK_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { spawnBackground } from "#src/services/exec/util/spawnBackground";
import { buildWslReapCommand } from "#src/services/exec/wsl/buildWslReapCommand";
import { WSL_RUN_ENTRY_REGEX } from "#src/services/exec/wsl/constants";
import { execWsl } from "#src/services/exec/wsl/execWsl";
import { getWslRunsDirectory } from "#src/services/exec/wsl/getWslRunsDirectory";
import { getResult, noop } from "@esposter/shared";
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
// The startup sweep: group-kill the WSL tree of every run whose owning host process is dead. A run's onTerminate
// Reaper (buildWslReapCommand) fires only on a handled SIGINT/SIGTERM — a hard kill (SIGKILL, crash, terminal close)
// Skips it, and killing the `wsl.exe` client does not always take the tree with it, so `sh`+bwrap can outlive the run
// And keep the store/snapshot pinned open. This reclaims exactly those, and it is the ONE thing it tests: a dead
// Owner. A live owner is a concurrent run — including this one, whose entries are written under this pid — so no
// Sweep can ever kill a run someone is still waiting on; and an owner is a live pid that started before its entry
// Was written (checkIsOwnerAlive), since the OS recycles a dead run's pid onto whatever starts next. The WSL process
// Tree's shape (whether a shell is still parented by its `Relay(<pid>)`) cannot stand in for that: a hard-killed
// Client leaves its relay alive for as long as the tree beneath it lives, so a shape test spares every real corpse
// While staying free to misfire on a live run as a bogus "bubblewrap failed to set up the sandbox"
// (getNoStatusFailureHeadline).
//
// Fired off the critical path and only when there is something to kill, so an ordinary run spawns no `wsl.exe` here
// At all. Entries are unlinked after the reaper is spawned rather than before: the kill is fire-and-forget, so the
// Unlink is what stops one corpse being re-reaped by every later run, and a re-reap costs nothing but a launch.
//
// `isBlocking` is for the one caller that depends on the corpses actually being gone rather than merely signalled —
// `cache clean`, which then removes the dirs those trees hold open. It runs the reaper synchronously and has it wait
// For the TERMed trees to exit (buildWslReapCommand's wait arm). A blocking reap that fails or times out keeps its
// Entries, so the corpse is re-reaped by the next sweep instead of being forgotten with its tree still alive.
export const reapOrphanedWslRuns = (isBlocking = false): void => {
  getResult(() => {
    const runsDirectory = getWslRunsDirectory();
    // Matched rather than split: anything in this directory that is not `<owner pid>.<marker>` is skipped outright,
    // Since a name with no owner half would otherwise hand `pgrep -f` a pattern nothing here wrote.
    const orphanedEntries = readdirSync(runsDirectory).flatMap((name) => {
      const { marker, ownerPid } = WSL_RUN_ENTRY_REGEX.exec(name)?.groups ?? {};
      if (marker === undefined || ownerPid === undefined) return [];
      if (checkIsOwnerAlive(Number(ownerPid), join(runsDirectory, name))) return [];
      return [{ marker, name }];
    });
    if (orphanedEntries.length === 0) return;

    const [file, ...args] = buildWslReapCommand(
      orphanedEntries.map(({ marker }) => marker),
      isBlocking,
    );
    if (isBlocking) execWsl(args, { timeout: WSL_WORK_TIMEOUT_MS });
    else spawnBackground(file, args);
    for (const { name } of orphanedEntries) rmSync(join(runsDirectory, name), { force: true });
  }).match(noop, ({ message }) => {
    writeVirrunDebug(`orphaned run sweep skipped — ${message}`);
  });
};
