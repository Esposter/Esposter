import type { ExecStdio } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
import type { BackendType } from "@/models/virrun/BackendType";
// The public handle returned by createVirrun. exec runs a command in the resolved backend; fork runs one
// Over a warm snapshot (specs/snapshot-fork.md). Deliberately tiny — backend name, exec, fork, dispose.
export interface Virrun {
  readonly backend: BackendType;
  // Tears down any temp state the source materialized. Always safe to call; a no-op for a dir source.
  dispose: () => Promise<void>;
  exec: (command: readonly string[] | string, stdio?: ExecStdio) => Promise<ExecResult>;
  // Runs a command over a warm snapshot of its own post-run state: the first call freezes that state into the
  // Snapshot upper, later calls stack it read-only and skip the heavy work (e.g. a re-install becomes a no-op).
  // The snapshot is keyed by lockfile hash in the host-global cache, so other repos with the same dependencies
  // Reuse it too. Os backend only — other backends have no overlay layer, so fork is identical to exec.
  fork: (command: readonly string[] | string, stdio?: ExecStdio) => Promise<ExecResult>;
}
