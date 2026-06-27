import type { ExecStdio } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
import type { BackendType } from "@/models/virrun/BackendType";
// The public handle returned by createVirrun. Deliberately tiny for the MVP — exec and the
// Resolved backend name. Snapshot/fork (specs/snapshot-fork.md) will extend this surface later.
export interface Virrun {
  readonly backend: BackendType;
  // Tears down any temp state the source materialized. Always safe to call; a no-op for a dir source.
  dispose: () => Promise<void>;
  exec: (command: readonly string[] | string, stdio?: ExecStdio) => Promise<ExecResult>;
}
