import { sweepStaleEntries } from "@/services/exec/snapshot/sweepStaleEntries";
// A run captures into a private `mkdtemp` sibling (`upper.<rand>`, `work.<rand>`, `upper.persist.<rand>`, or a source
// Clone's `virrun-temp-<rand>`) and only its in-process finalizer removes it. A hard kill (SIGKILL, crash,
// `wsl --shutdown`) skips that finalizer, stranding the temp; and pruneStale* only evicts whole *superseded* hash dirs,
// So a corpse in the *live* dir (or in the shared source-temp root, which nothing else sweeps) would accumulate
// Forever. Reap it beside the prune — same capture-once/serial-persist assumption (no live run holds a temp here).
// Match only entries starting with a mkdtemp `<name>.`/`<name>-` prefix, so the published bare `upper`/`work` and
// Every non-temp entry survive.
export const reapStaleTemps = (dir: string, prefixes: readonly string[]): void => {
  sweepStaleEntries(dir, (name) => prefixes.some((prefix) => name.startsWith(prefix)));
};
