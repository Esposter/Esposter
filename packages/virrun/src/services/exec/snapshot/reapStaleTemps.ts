import { sweepStaleEntries } from "#src/services/exec/snapshot/sweepStaleEntries";
import { checkIsProcessAlive } from "#src/services/exec/util/checkIsProcessAlive";
import { parseTempOwnerPid } from "#src/services/exec/util/parseTempOwnerPid";
// A capture/persist run writes into a private pid-tagged `mkdtemp` sibling of the live snapshot/prepare hash dir
// (`<base>.<pid>.<rand>`, withPidTempPrefix) and its in-process finalizer removes it on a clean exit. A hard kill
// (SIGKILL, crash, `wsl --shutdown`) skips that finalizer, stranding the temp; and pruneStale* only evicts whole
// *Superseded* hash dirs, so a corpse in the *live* dir would accumulate forever. Reap it beside the prune — but read
// The owner pid back out of the name (parseTempOwnerPid) and reclaim only a *dead* owner's corpse, so a concurrent run
// Whose temp shares this hash dir (same lockfile) is never deleted mid-exec. The published bare `upper`/`work` and the
// `leases/` sibling carry no owner pid and are always kept. (Not for the shared `os.tmpdir()` source-clone root — that
// Is concurrent with no per-entry owner, so it is left to the OS's tmp reaping.)
export const reapStaleTemps = (dir: string, prefixes: readonly string[]): void => {
  sweepStaleEntries(dir, (name) => {
    const pid = parseTempOwnerPid(name, prefixes);
    return pid !== undefined && !checkIsProcessAlive(pid);
  });
};
