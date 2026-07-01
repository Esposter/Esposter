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
  // Runs a command over a warm dependency snapshot, provisioning it first if needed (specs/snapshot-fork.md).
  // Os backend only — other backends have no overlay layer, so fork is identical to exec.
  fork: (command: readonly string[] | string, stdio?: ExecStdio) => Promise<ExecResult>;
  // Like fork, but PERSISTS the command's produced files back to the host so a mutation command (eslint --fix,
  // Db:gen, build) leaves disk exactly as native would (specs/write-back.md); node_modules (the read-only snapshot
  // Lower) never flushes. Os backend only; other backends plain-exec.
  persist: (command: readonly string[] | string, stdio?: ExecStdio) => Promise<ExecResult>;
}
