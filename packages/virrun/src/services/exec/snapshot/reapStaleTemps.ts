import { sweepStaleEntries } from "@/services/exec/snapshot/sweepStaleEntries";
// A capture/persist run writes into a private `mkdtemp` sibling of the live snapshot/prepare hash dir (`upper.<rand>`,
// `work.<rand>`, `upper.persist.<rand>`) and only its in-process finalizer removes it. A hard kill (SIGKILL, crash,
// `wsl --shutdown`) skips that finalizer, stranding the temp; and pruneStale* only evicts whole *superseded* hash dirs,
// So a corpse in the *live* dir would accumulate forever. Reap it beside the prune — safe on the same
// Capture-once/serial-persist assumption the prune already banks on (no live run holds a temp in this per-hash dir).
// Match only entries starting with a mkdtemp `<name>.` prefix, so the published bare `upper`/`work` and every non-temp
// Entry survive. (Not for the shared `os.tmpdir()` source-clone root — that is concurrent, so a blanket sweep there
// Would delete a live sibling run's clone; those are left to the OS's tmp reaping.)
export const reapStaleTemps = (dir: string, prefixes: readonly string[]): void => {
  sweepStaleEntries(dir, (name) => prefixes.some((prefix) => name.startsWith(prefix)));
};
