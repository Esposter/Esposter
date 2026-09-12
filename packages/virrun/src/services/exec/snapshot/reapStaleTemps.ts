import { sweepStaleEntries } from "#src/services/exec/snapshot/sweepStaleEntries";
import { checkIsOwnerAlive } from "#src/services/exec/util/checkIsOwnerAlive";
import { parseTempOwnerPid } from "#src/services/exec/util/parseTempOwnerPid";
// A capture/persist run writes into a private pid-tagged `mkdtemp` sibling of the live snapshot/prepare hash directory
// (`<base>.<pid>.<rand>`, withPidTempPrefix) and its in-process finalizer removes it on a clean exit. A hard kill
// (SIGKILL, crash, `wsl --shutdown`) skips that finalizer, stranding the temp; and pruneStale* only evicts whole
// *Superseded* hash directories, so a corpse in the *live* directory would accumulate forever. Reap it beside the prune — but read
// The owner pid back out of the name (parseTempOwnerPid) and reclaim only a *dead* owner's corpse, so a concurrent run
// Whose temp shares this hash directory (same lockfile) is never deleted mid-exec. The published bare `upper`/`work` and the
// `leases/` sibling carry no owner pid and are always kept. (Not for the shared `os.tmpdir()` source-clone root — that
// Is concurrent with no per-entry owner, so it is left to the OS's tmp reaping.)
export const reapStaleTemps = (directory: string, prefixes: readonly string[]): void => {
  sweepStaleEntries(directory, (name, path) => {
    const pid = parseTempOwnerPid(name, prefixes);
    return pid !== undefined && !checkIsOwnerAlive(pid, path);
  });
};
